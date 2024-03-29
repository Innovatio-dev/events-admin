import { json, error as httpError, type RequestEvent } from '@sveltejs/kit'
import { OrganizerRequest } from '$lib/server/models/request'
import Joi from 'joi'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { getConnection } from '$lib/server/config/database'
import { encodedIntegerArray, orderSchema } from '$lib/utils/validation/schemas'
import sequelize, { Op, type Includeable, type Order } from 'sequelize'
import { Country } from '$lib/server/models/country'
import { Region } from '$lib/server/models/region'

const schema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	limit: Joi.number().min(-1).optional().default(10),
	status: encodedIntegerArray.optional(),
	regionId: encodedIntegerArray.optional(),
	typeEvent: encodedIntegerArray.optional(),
	order: orderSchema([
		'id',
		'uid',
		'email',
		'createdAt',
		'name',
		'country',
		'typeEvent',
		'status'
	]).optional(),
	search: Joi.string().optional()
})

const postSchema = Joi.object({
	name: Joi.string(),
	company: Joi.string(),
	countryId: Joi.number().required(),
	city: Joi.string(),
	email: Joi.string(),
	phone: Joi.string(),
	website: Joi.string(),
	twitter: Joi.string(),
	instagram: Joi.string(),
	linkedin: Joi.string(),
	facebook: Joi.string(),
	youtube: Joi.string(),
	mavieId: Joi.string(),
	description: Joi.string(),
	logoId: Joi.number(),
	regions: Joi.array().required()
})

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, schema)
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
				`(SELECT "organizerRequestId" FROM "OrganizerRequestRegion" 
					WHERE "regionId" IN (${filter.regionId.join(',')}))`
			)
		}
	}
	if (filter.search) {
		const search = `%${filter.search}%`
		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('OrganizerRequest.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.cast(sequelize.col('OrganizerRequest.id'), 'text'), {
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
			OrganizerRequest.count({
				where,
				include: includedCount,
				transaction
			}),
			OrganizerRequest.scope('list').findAll({
				where,
				limit: filter.limit >= 0 ? filter.limit : undefined,
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
	const { regions, countryId, ...values } = await validateBody(event, postSchema)
	const connection = await getConnection()
	const transaction = await connection.transaction()
	try {
		let organizerRequest = await OrganizerRequest.create(
			{
				...values
			},
			{ transaction }
		)
		if (regions) {
			await organizerRequest.setRegions(regions, { transaction })
		}
		if (countryId) {
			await organizerRequest.setCountry(countryId, { transaction })
		}

		await transaction.commit()
		organizerRequest = (await OrganizerRequest.scope('full').findByPk(
			organizerRequest.id
		)) as OrganizerRequest
		return json(organizerRequest)
	} catch (error) {
		console.log(error)
		await transaction.rollback()
		const errorWithNameAndErrors = error as { errors?: []; name?: string }
		if (
			'name' in errorWithNameAndErrors &&
			errorWithNameAndErrors.name == 'SequelizeUniqueConstraintError'
		) {
			const message = 'Some fields must be uniques'
			throw httpError(400, message)
		}
		throw error
	}
}
