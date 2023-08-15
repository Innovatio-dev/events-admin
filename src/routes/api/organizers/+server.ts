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
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const order: Order = []
	const where: any = {}
	const connection = await getConnection()

	if (filter.status != null) {
		where.status = { [Op.in]: filter.status }
	}
	if (filter.typeEvent != null) {
		if (filter.typeEvent.includes(Organizer.TYPE_EVENT_BOTH)) {
			where.typeEvent = {
				[Op.in]: [
					Organizer.TYPE_EVENT_LIVE,
					Organizer.TYPE_EVENT_VIRTUAL,
					Organizer.TYPE_EVENT_BOTH
				]
			}
		} else {
			where.typeEvent = { [Op.in]: [...filter.typeEvent, Organizer.TYPE_EVENT_BOTH] }
		}
	} else {
		where.typeEvent = {
			[Op.in]: [
				Organizer.TYPE_EVENT_LIVE,
				Organizer.TYPE_EVENT_VIRTUAL,
				Organizer.TYPE_EVENT_BOTH
			]
		}
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
		let search = `%${filter.search}%`
		const regex = new RegExp("^[uU][0-9]*");

		if(regex.test(filter.search)) {
			search = '%' + parseInt(filter.search.substring(1)) + '%'
		}

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Organizer.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.cast(sequelize.col('Organizer.id'), 'text'), {
				[sequelize.Op.iLike]: search
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Organizer.email')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
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
						},
					}
				],
				order,
				transaction
			})
		])

		await transaction.commit()

		if (filter.export) {
			const opts = {}
			const parser = new Parser(opts)

			const S3 = new AWS.S3({
				accessKeyId: AS_ACCESS_KEY_ID,
				secretAccessKey: AS_SECRET_ACCESS_KEY,
				region: AS_REGION
			})

			const organizers: Array<string | any> = []
			for (const iterator of results) {
				organizers.push({
					name: iterator.name,
					company: iterator.company,
					email: iterator.email,
					country: iterator.country.nicename,
					mavieId: iterator.mavieId ?? 'N/A'
				})
			}

			const csv = parser.parse(organizers)

			const data = {
				Bucket: s3BucketName,
				Key: 'data/dumpdata_organizers.csv',
				Body: csv,
				ContentEncoding: 'base64'
			}

			S3.upload(data, function (err, data) {
				if (err) {
					console.log(err)
					console.log('Error uploading data')
				} else {
					console.log('succesfully uploaded!!!')
				}
			})

			return json({
				count,
				formedUrl: `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/data/dumpdata_organizers.csv`,
				results
			})
		}

		return json({
			count,
			results
		})
	} catch (error) {
		console.log(error)
		transaction.rollback()
		throw httpError(HttpResponses.UNEXPECTED_ERROR, {
			message: 'An error has been ocurred when accessing to database ' + error
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
