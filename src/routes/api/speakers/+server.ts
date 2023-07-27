import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Resource } from '$lib/server/models/resource'
import { Speaker } from '$lib/server/models/speaker'
import { User } from '$lib/server/models/user'
import { foreignKeyOf } from '$lib/server/validation/schemas'
import { createSchema, filterSchema } from '$lib/utils/validation/speakerSchema'
import { json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op, type Order } from 'sequelize'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const where: any = {}
	const order: Order = []
	if (filter.search) {
		const search = `%${filter.search}%`

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Speaker.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Speaker.company')), {
				[sequelize.Op.iLike]: search
			})
		]
	}
	if (filter.order) {
		for (const col of filter.order) {
			const name = col.name
			if (col.name == 'country') {
				order.push([{ model: Country, as: 'country' }, 'name', col.type])
			} else {
				order.push([name, col.type])
			}
		}
	}
	const count = await Speaker.count({ where })
	const results = await Speaker.scope('mini').findAll({
		limit: filter.limit > 0 ? filter.limit : undefined,
		offset: filter.offset,
		where,
		order
	})

	return json({ count, results })
}
export async function POST(event: RequestEvent) {
	checkUser(event, User.ADMIN)
	const data = await validateBody(
		event,
		createSchema.keys({
			pictureId: foreignKeyOf(Resource),
			countryId: foreignKeyOf(Country)
		})
	)
	const result = await Speaker.create(data)
	const speaker = await Speaker.scope('full').findByPk(result.id)
	return json(speaker)
}
