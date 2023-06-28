import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Resource } from '$lib/server/models/resource'
import { Speaker } from '$lib/server/models/speaker'
import { User } from '$lib/server/models/user'
import { foreignKeyOf } from '$lib/server/validation/schemas'
import { createSchema, filterSchema } from '$lib/utils/validation/speakerSchema'
import { json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op } from 'sequelize'
interface DynamicObject {
	[key: string]: string | number
}
export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const where: DynamicObject = {}
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
	const count = await Speaker.count({ where })
	const results = await Speaker.scope('mini').findAll({
		limit: filter.limit > 0 ? filter.limit : undefined,
		offset: filter.offset,
		where
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
	return json(result)
}
