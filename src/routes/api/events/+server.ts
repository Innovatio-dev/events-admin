import { getConnection } from '$lib/server/config/database'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Event } from '$lib/server/models/event'
import { Region } from '$lib/server/models/region'
import { Schedule } from '$lib/server/models/schedule'
import { Venue } from '$lib/server/models/venue'
import { createSchema, filterSchema } from '$lib/utils/validation/eventSchema'
import { json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op, type Order } from 'sequelize'
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'
import { SENDINBLUE_API_KEY } from '$env/static/private'
import SibApiV3Sdk from 'sib-api-v3-sdk'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const where: any = {}
	const whereVenue: any = {} // Object for venue model's filter conditions
	const whereRegion: any = {} // Object for region model's filter conditions
	const whereCountry: any = {} // Object for country model's filter conditions
	const whereSchedule: any = {}
	const order: Order = [] // Array to store order conditions

	// Filter conditions for event model
	if (filter.regionId) {
		whereRegion.id = filter.regionId
	}
	if (filter.countryId) {
		whereCountry.id = filter.countryId
	}
	if (filter.organizerId) {
		where.organizerId = filter.organizerId
	}
	if (filter.dateMin && filter.dateMax) {
		whereSchedule.date = {
			[Op.between]: [filter.dateMin, filter.dateMax]
		}
	} else if (filter.dateMin) {
		whereSchedule.startTime = {
			[Op.gte]: filter.dateMin
		}
	} else if (filter.dateMax) {
		whereSchedule.startTime = {
			[Op.lte]: filter.dateMax
		}
	}

	if (filter.typeEvent) {
		where.typeEvent = filter.typeEvent
	}

	if (filter.order) {
		for (const col of filter.order) {
			let name = col.name
			if (col.name == 'uid') {
				name = 'id'
			}
			order.push([name, col.type])
		}
	}
	if (filter.search) {
		const search = `%${filter.search}%`

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Event.title')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.cast(sequelize.col('Event.id'), 'text'), {
				[sequelize.Op.iLike]: search
			})
		]
	}
	if (filter.countryId) {
		whereCountry.id = filter.countryId
	}
	// Count events based on filter conditions and associations
	const count = await Event.count({
		where,
		include: [
			{
				model: Venue,
				as: 'venue',
				where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region',
						where: whereRegion // Apply region filter conditions
					},
					{
						model: Country,
						as: 'country',
						where: whereCountry // Apply country filter conditions
					}
				]
			}
		]
	})

	// Fetch events based on filter conditions and associations
	const results = await Event.scope('list').findAll({
		where,
		limit: filter.limit >= 0 ? filter.limit : undefined,
		offset: filter.offset,
		order,
		include: [
			{
				model: Venue,
				as: 'venue',
				where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region',
						where: whereRegion // Apply region filter conditions
					},
					{
						model: Country.scope('full'),
						as: 'country',
						where: whereCountry // Apply country filter conditions
					}
				]
			},
			{
				model: Schedule,
				as: 'schedule',
				where: whereSchedule,
				required: filter.dateMax != null || filter.dateMin != null
			}
		]
	})

	if (filter.export) {
		try {
			const opts = {}
			const parser = new Parser(opts)

			const S3 = new AWS.S3({
				accessKeyId: AS_ACCESS_KEY_ID,
				secretAccessKey: AS_SECRET_ACCESS_KEY,
				region: AS_REGION
			})

			let events: Array<string | any> = []
			for (const iterator of results) {
				events.push({
					name: iterator.title,
					slug: iterator.slug,
					date: iterator.schedule.startTime,
					location: iterator.venue.city,
					region: iterator.venue.region.name,
					country: iterator.venue.country.nicename,
					featured: iterator.isFeatured
				})
			}

			const csv = parser.parse(events)

			var data = {
				Bucket: s3BucketName,
				Key: 'public/dumpdata.csv',
				Body: csv,
				ContentEncoding: 'base64'
			}

			// const putObjectRequest: PutObjectRequest
			S3.upload(data, function (err, data) {
				if (err) {
					console.log(err)
					console.log('Error uploading data')
				} else {
					console.log('succesfully uploaded!!!')
				}
			})
		} catch (err) {
			console.error(err)
		}
	}

	// Return the count and results as JSON response
	const formedUrl = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/public/dumpdata.csv`
	if (filter.export) {
		return json({
			count,
			formedUrl,
			results
		})
	}
	return json({
		count,
		results
	})
}

export async function POST(event: RequestEvent) {
	const user = checkUser(event)
	//TODO: Create eventSpeakers based on array of speakers
	const { pictures, bannerId, bannerMobileId, ...values } = await validateBody(
		event,
		createSchema
	)
	const connection = await getConnection()
	const transaction = await connection.transaction()
	try {
		let defaultClient = SibApiV3Sdk.ApiClient.instance
		let apiKey = defaultClient.authentications['api-key']
		apiKey.apiKey = SENDINBLUE_API_KEY

		let apiInstance = new SibApiV3Sdk.ContactsApi()
		let createList = new SibApiV3Sdk.CreateList()

		createList.name = values.title
		createList.folderId = 5

		const data = await apiInstance.createList(createList)
		values.mailing = data.id

		let event = await Event.create(
			{
				...values
			},
			{ transaction, include: [{ model: Schedule, as: 'schedule' }] }
		)

		if (pictures) {
			await event.setPictures(pictures, { transaction })
		}
		if (bannerId) {
			await event.setBanner(bannerId, { transaction })
		}
		if (bannerMobileId) {
			await event.setBannerMobile(bannerMobileId, { transaction })
		}
		await transaction.commit()
		event = (await Event.scope('full').findByPk(event.id)) as Event
		return json(event)
	} catch (error) {
		console.log(error)
		await transaction.rollback()
		throw error
	}
}
