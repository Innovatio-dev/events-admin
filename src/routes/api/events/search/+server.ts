import { validateSearchParam } from '$lib/server/middlewares/validator'
import { Event } from '$lib/server/models/event'
import { json, type RequestEvent } from '@sveltejs/kit'
import Joi from 'joi'
import sequelize from 'sequelize'

const schema = Joi.object({
	q: Joi.string().min(3).required(),
	offset: Joi.number().min(0).optional().default(0),
	limit: Joi.number().min(0).max(100).optional().default(10)
})

export async function GET(event: RequestEvent) {
	const params = validateSearchParam(event, schema)
	const search = `%${params.q}%`
	const where = sequelize.or(
		sequelize.where(sequelize.fn('unaccent', sequelize.col('Event.title')), {
			[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
		}),
		sequelize.where(sequelize.fn('unaccent', sequelize.col('Event.description')), {
			[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
		}),
		sequelize.where(sequelize.fn('unaccent', sequelize.col('venue.city')), {
			[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
		}),
		sequelize.where(sequelize.fn('unaccent', sequelize.col('venue->region.name')), {
			[sequelize.Op.iLike]: sequelize.fn('unaccent', `%${search}%`) // búsqueda por venue.region.name
		}),

		sequelize.where(sequelize.fn('unaccent', sequelize.col('venue->country.name')), {
			[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
		})
	)

	const count = await Event.scope('list').count({ where })
	const results = await Event.scope('list').findAll({
		where,
		offset: params.offset,
		limit: params.limit
	})
	return json({
		count,
		results
	})
}
