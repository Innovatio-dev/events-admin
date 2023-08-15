import { getConnection } from '$lib/server/config/database'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Event } from '$lib/server/models/event'
import { Region } from '$lib/server/models/region'
import { Schedule } from '$lib/server/models/schedule'
import { Venue } from '$lib/server/models/venue'
import { createSchema, filterSchema } from '$lib/utils/validation/eventSchema'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op, type Order } from 'sequelize'
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'
import { SENDINBLUE_API_KEY } from '$env/static/private'
import SibApiV3Sdk from 'sib-api-v3-sdk'
import type { Speaker } from '$lib/server/models/speaker'
import { EventSpeaker } from '$lib/server/models/eventSpeaker'
import { HttpResponses } from '$lib/server/constants/httpResponses'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	let where: any = {}
	
	if (filter.regionId) {
		where = {
			'$venue.region.id$': { [Op.in]: filter.regionId }
		}
	}
	// const whereVenue: any = {} // Object for venue model's filter conditions
	// const whereRegion: any = {} // Object for region model's filter conditions
	const whereCountry: any = {} // Object for country model's filter conditions
	const whereSchedule: any = {}
	const order: Order = [] // Array to store order conditions

	// Filter conditions for event model
	
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

	if (filter.typeEvent != null) {
		where.typeEvent = { [Op.in]: filter.typeEvent }
	}
	if (filter.status != null) {
		where.status = { [Op.in]: filter.status }
	}

	if (filter.order) {
		for (const col of filter.order) {
			let name = col.name
			if (col.name == 'uid') {
				name = 'id'
				order.push([name, col.type])
			} else if (col.name == 'country') {
				order.push(['venue','country', 'name', col.type])
			} else {
				order.push([name, col.type])
			}
		}
	}
	if (filter.search) {
		let search = `%${filter.search}%`
		const regex = new RegExp("^[eE][0-9]*");

		if(regex.test(filter.search)) {
			search = '%' + parseInt(filter.search.substring(1)) + '%'
		}

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

	// console.log(where);
	
	// Count events based on filter conditions and associations
	const count = await Event.count({
		where,
		include: [
			{
				model: Venue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region' // Apply region filter conditions
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
		limit: filter.limit >= 0 ? filter.limit : 50,
		offset: filter.offset,
		order,
		include: [
			{
				model: Venue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region',
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
				where: whereSchedule
				// required: filter.dateMax != null || filter.dateMin != null
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

			const events: Array<string | any> = []
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

			const data = {
				Bucket: s3BucketName,
				Key: 'public/dumpdata.csv',
				Body: csv,
				ContentEncoding: 'base64'
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	// const user = checkUser(event)
	//TODO: Create eventSpeakers based on array of speakers
	const {
		pictures,
		bannerId,
		speakers,
		speakersSecondary,
		bannerMobileId,
		schedule,
		venue,
		...values
	} = await validateBody(event, createSchema)

	const connection = await getConnection()
	const transaction = await connection.transaction()
	try {
		const defaultClient = SibApiV3Sdk.ApiClient.instance
		const apiKey = defaultClient.authentications['api-key']
		apiKey.apiKey = SENDINBLUE_API_KEY

		const apiInstance = new SibApiV3Sdk.ContactsApi()
		const createList = new SibApiV3Sdk.CreateList()

		createList.name = values.title
		createList.folderId = 5
		values.userId = 1

		if(venue.length > 0) {
			values.venueId = venue[0].id
			values.regionId = venue[0].region.id
		}
		else {
			const virtual = await Venue.findOne({
				where: {
					address: 'Online' 
				},
				include: [
					{
						model: Region,
						as: 'region'
					}
				]
			})
			if(virtual) {
				values.venueId = virtual.id
				values.regionId = virtual.region.id	
			}
		}
		console.log('after venue')

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

		// let speakersMap: Array<Speaker> = []

		if (speakers && speakers.length > 0) {
			// for (const iterator of speakers) {
			// 	const element = await Speaker.findByPk(iterator)
			// 	if (element) {
			// 		speakersMap.push(element)
			// 	}
			// }
			const snapshotSpeakers = await Promise.all(
				speakers.map((speaker: Speaker, index: number) =>
					createSpeakerSnapshot(speaker, event, true, index, transaction)
				)
			)
			await event.setEventSpeakers(snapshotSpeakers)
		}

		// speakersMap = []
		if (speakersSecondary && speakersSecondary.length > 0) {
			// for (const iterator of speakersSecondary) {
			// 	const element = await Speaker.findByPk(iterator)
			// 	if (element) {
			// 		speakersMap.push(element)
			// 	}
			// }
			const snapshotSpeakers = await Promise.all(
				speakersSecondary.map((speaker: Speaker, index: number) =>
					createSpeakerSnapshot(speaker, event, false, index, transaction)
				)
			)
			await event.setEventSpeakers(snapshotSpeakers)
		}

		await event.setSchedule(
			await Schedule.create(
				{
					startTime: schedule.startTime,
					endTime: schedule.endTime
				},
				{ transaction }
			),
			{ transaction }
		)

		await transaction.commit()
		event = (await Event.scope('full').findByPk(event.id)) as Event
		return json(event)
	} catch (err: any) {
		await transaction.rollback()
		if(err.name === 'SequelizeUniqueConstraintError') {
			if(err.errors[0].path === 'slug') {
				throw error(HttpResponses.UNIQUE_CONSTRAINT, {
					message: 'Validation Error:  Unique, This Event Name and Slud Already Exists'
				})
			}
			throw error(HttpResponses.UNIQUE_CONSTRAINT, {
				message: 'Validation Error:  Unique constrain Error'
			})
		}
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend, try again later ' + err
		})
	}
}

async function createSpeakerSnapshot(
	speaker: Speaker,
	event: Event,
	primary: boolean,
	order: number,
	transaction: sequelize.Transaction
) {
	//increase refCount of image
	// const image = await speaker.getPicture()
	// const country = await speaker.getCountry()
	const speakerSnapshot = await EventSpeaker.create(
		{
			status: speaker.status,
			name: speaker.name,
			jobRole: speaker.jobRole,
			company: speaker.company,
			instagram: speaker.instagram,
			linkedin: speaker.linkedin,
			facebook: speaker.facebook,
			youtube: speaker.youtube,
			description: speaker.description,
			speakerId: speaker.id,
			primary,
			order,
			eventId: event.id
		},
		{ transaction }
	)
	speakerSnapshot.setPicture(speaker.picture.id, {transaction})
	speakerSnapshot.setCountry(speaker.country.id, {transaction})
	// speakerSnapshot.setPicture(image, {transaction})
	// speakerSnapshot.setCountry(country, {transaction})
	await speakerSnapshot.save()
	return speakerSnapshot
}
