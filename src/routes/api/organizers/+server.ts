import { getConnection } from '$lib/server/config/database'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Organizer } from '$lib/server/models/organizer'
import { OrganizerLog } from '$lib/server/models/organizerLog'
import { Region } from '$lib/server/models/region'
import { Resource } from '$lib/server/models/resource'
import { json, type RequestEvent, error as httpError } from '@sveltejs/kit'
import { createSchema, filterSchema } from '$lib/utils/validation/organizerSchema'
import sequelize, { Op, type Includeable, type Order } from 'sequelize'
import { foreignKeyOf, uniqueKeyOf } from '$lib/server/validation/schemas'
import Joi from 'joi'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const order: Order = []
	const where: any = {}
	const connection = await getConnection()

	if (filter.status != null) {
		where.status = { [Op.in]: filter.status }
	}
	if (filter.typeEvent != null) {
		where.typeEvent = { [Op.in]: filter.typeEvent }
	}
	if (filter.order) {
		for (const col of filter.order) {
			let name = col.name
			if (col.name == 'uid') {
				name = 'id'
			}
			if (col.name == 'country') {
				order.push([{ model: Country, as: 'country' }, 'name', col.type])
			} else {
				order.push([name, col.type])
			}
		}
	}
	if (filter.regionId) {
		where.id = {
			[Op.in]: connection.literal(
				`(SELECT "organizerId" FROM "OrganizerRegion" 
					WHERE "regionId" IN (${filter.regionId.join(',')}))`
			)
		}
	}
	if (filter.search) {
		const search = `%${filter.search}%`

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Organizer.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.cast(sequelize.col('Organizer.id'), 'text'), {
				[sequelize.Op.iLike]: search
			})
		]
	}
	const transaction = await connection.transaction()
	try {
		const includedCount: Includeable[] = []
		if (filter.search) {
			includedCount.push({
				model: Country,
				as: 'country'
			})
		}
		const [count, results] = await Promise.all([
			Organizer.count({
				where,
				include: includedCount,
				transaction
			}),
			Organizer.scope('list').findAll({
				where,
				limit: filter.limit,
				offset: filter.offset,
				include: [
					{
						model: Region,
						as: 'regions',
						through: {
							attributes: []
						}
					}
				],
				order,
				transaction
			})
		])

		await transaction.commit()

		return json({
			count,
			results
		})
	} catch (error) {
		console.log(error)
		transaction.rollback()
		throw httpError(HttpResponses.UNEXPECTED_ERROR, {
			message: 'An error has been ocurred when accessing to database'
		})
	}
}

export async function POST(event: RequestEvent) {
	const user = checkUser(event)
	const { regions, countryId, ...values } = await validateBody(
		event,
		createSchema.keys({
			countryId: foreignKeyOf(Country),
			regions: Joi.array().items(foreignKeyOf(Region)),
			email: uniqueKeyOf(Organizer, 'email').required(),
			logoId: foreignKeyOf(Resource)
		})
	)
	const connection = await getConnection()
	const transaction = await connection.transaction()

	try {
		let organizer = await Organizer.create(
			{
				...values
			},
			{ transaction }
		)
		if (regions) {
			await organizer.setRegions(regions, { transaction })
		}
		if (countryId) {
			await organizer.setCountry(countryId, { transaction })
		}
		await OrganizerLog.create(
			{
				status: organizer.status,
				reason: 'Created',
				organizerId: organizer.id,
				userId: user.id
			},
			{ transaction }
		)
		await transaction.commit()
		organizer = (await Organizer.scope('full').findByPk(organizer.id)) as Organizer
		return json(organizer)
	} catch (error) {
		await transaction.rollback()

		throw error
	}
}
