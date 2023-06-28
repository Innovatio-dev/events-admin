import { json, error, type RequestEvent } from '@sveltejs/kit'
import { Venue } from '$lib/server/models/venue'
import Joi from 'joi'
import { validateSearchParam } from '$lib/server/middlewares/validator'
import { Region } from '$lib/server/models/region'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { Country } from '$lib/server/models/country'
import sequelize from 'sequelize'

const schema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	regionId: Joi.number().min(0).optional(),
	limit: Joi.number().min(-1).optional().default(10),
	search: Joi.string().min(0).optional()
})

interface DynamicObject {
	[key: string]: string | number
}

export async function GET(event: RequestEvent) {
	const where: DynamicObject = {}
	const filter = validateSearchParam(event, schema)

	if (filter.regionId) {
		where.regionId = filter.regionId
	}
	if (filter.search) {
		const search = `%${filter.search}%`

		where[sequelize.Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Venue.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Venue.city')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('region.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', `%${search}%`)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('country.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			})
		]
	}

	const count = await Venue.count({
		where,
		include: filter.search
			? [
					{ model: Region, as: 'region' },
					{ model: Country, as: 'country' }
			  ]
			: []
	})
	const results = await Venue.scope('list').findAll({
		where,
		limit: filter.limit >= 0 ? filter.limit : undefined,
		offset: filter.offset,
		include: [
			{
				model: Region,
				as: 'region'
			},
			{
				model: Country,
				as: 'country'
			}
		]
	})

	return json({
		count,
		results
	})
}

const postSchema = Joi.object({
	name: Joi.string(),
	country: Joi.string(),
	city: Joi.string(),
	address: Joi.string(),
	location: Joi.object(),
	email: Joi.string(),
	description: Joi.string()
})

export async function POST(event: RequestEvent) {
	const data = await event.request.json()
	const validate = postSchema.validate(data)

	try {
		const result = await Venue.create(validate.value)
		return json(result)
	} catch (err) {
		console.log(err)
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend, try again later'
		})
	}
}
