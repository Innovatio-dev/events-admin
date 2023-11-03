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
import { Speaker } from '$lib/server/models/speaker'
import { EventSpeaker } from '$lib/server/models/eventSpeaker'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { EventVenue } from '$lib/server/models/eventVenue'

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
				order.push(['venue', 'country', 'name', col.type])
			} else {
				order.push([name, col.type])
			}
		}
	}
	if (filter.search) {
		let search = `%${filter.search}%`
		const regex = new RegExp('^[eE][0-9]*')

		if (regex.test(filter.search)) {
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

	// Count events based on filter conditions and associations
	const count = await Event.count({
		where,
		include: [
			{
				model: EventVenue,
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
				model: EventVenue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region'
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
	const user = checkUser(event)
	const {
		pictures,
		bannerId,
		speakers,
		speakersSecondary,
		bannerMobileId,
		schedule,
		pinPhoto,
		venue,
		...values
	} = await validateBody(event, createSchema)
	// return json(await event.request.json())
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
		values.userId = user.id

		if (venue.length > 0) {
			let tempVenue: Venue | null = null 
			if(venue[0].hasOwnProperty('id')) {
				tempVenue = await Venue.findByPk(venue[0].id, {transaction})
			}
			else {
				const { pictures, data } = venue[0]
				tempVenue = await Venue.create({
					...data
				})
				await tempVenue.setPictures(pictures, {transaction})
			}
			
			if (!tempVenue) {
				throw error(HttpResponses.NOT_FOUND, {
					message: 'Validation Error:  Venue does not exists'
				})
			}
			const eventVenueSnapshot = await createVenueSnapshot(tempVenue, venue[0], transaction)
			// console.log(eventVenueSnapshot)
			values.eventVenueId = eventVenueSnapshot.id
			if (venue[0].region) {
				values.regionId = venue[0].region.id
			}
			if(tempVenue.regionId) {
				values.regionId = tempVenue.regionId
			}
			
		} else {
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
			if (virtual) {
				const eventVenueSnapshot = await createVenueSnapshot(virtual, virtual, transaction)
				values.eventVenueId = eventVenueSnapshot.id
				values.regionId = virtual.region.id
			}
		}
		const data = await apiInstance.createList(createList)
		values.mailing = data.id

		if(pinPhoto && pinPhoto.length > 0) {
			values.pinphoto = pinPhoto[0]
		}
		if (pictures.length > 0) {
			// await event.setPictures(pictures, { transaction })
			values.bannerId = pictures[0]
		}
		if (bannerId) {
			// await event.setBanner(bannerId, { transaction })
			values.bannerId = bannerId
		}
		if (bannerMobileId) {
			// await event.setBannerMobile(bannerMobileId, { transaction })
			values.bannerMobileId = bannerMobileId
		}

		let event = await Event.create(
			{
				...values
			},
			{ transaction, include: [{ model: Schedule, as: 'schedule' }] }
		)

		if (pictures.length > 0) {
			await event.setPictures(pictures, { transaction })
		}
		if (speakers && speakers.length > 0) {
			const snapshotSpeakers = await Promise.all(
				speakers.map(async (speaker: Speaker, index: number) => {
					if(speaker.hasOwnProperty('id')) {
						// check if the want to update the image
						if (Array.isArray(speaker.picture)) {
							//? then the speaker has a new photo
							speaker.picture = {
								id: speaker.picture[0]
							}
						}
						return createSpeakerSnapshot(speaker, event, true, index, transaction)
					}
					else {
						// its a new speaker not in the db
						// await create new speaker
						const { picture, ...data } = speaker
						const newSpeaker = await Speaker.create({
							...data,
							pictureId: picture[0]
						})
						// await create and add the snapshot
						return createSpeakerSnapshot(newSpeaker, event, true, index, transaction)
					}
					// return createSpeakerSnapshot(speaker, event, true, index, transaction)
				}
				)
			)
			await event.setEventSpeakers(snapshotSpeakers)
		}

		// speakersMap = []
		if (speakersSecondary && speakersSecondary.length > 0) {
			// const snapshotSpeakers = await Promise.all(
			// 	speakersSecondary.map((speaker: Speaker, index: number) =>
			// 		createSpeakerSnapshot(speaker, event, false, index, transaction)
			// 	)
			// )
			const snapshotSpeakers = await Promise.all(
				speakersSecondary.map(async (speaker: Speaker, index: number) => {
					if(speaker.hasOwnProperty('id')) {
						// check if the want to update the image
						if (Array.isArray(speaker.picture)) {
							//? then the speaker has a new photo
							speaker.picture = {
								id: speaker.picture[0]
							}
						}
						return createSpeakerSnapshot(speaker, event, true, index, transaction)
					}
					else {
						// its a new speaker not in the db
						// await create new speaker
						const { picture, ...data } = speaker
						const newSpeaker = await Speaker.create({
							...data,
							pictureId: picture[0]
						})
						// await create and add the snapshot
						return createSpeakerSnapshot(newSpeaker, event, true, index, transaction)
					}
					// return createSpeakerSnapshot(speaker, event, true, index, transaction)
				}
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
		console.log(err);
		await transaction.rollback()
		if (err.name === 'SequelizeUniqueConstraintError') {
			if (err.errors[0].path === 'slug') {
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
	let pictureId = null
	let countryId = null
	if (speaker.picture) {
		pictureId = speaker.picture.id
	}
	if (speaker.pictureId) {
		pictureId = speaker.pictureId
	}
	if (speaker.country) {
		countryId = speaker.country.id
	}
	if (speaker.countryId) {
		countryId = speaker.countryId
	}

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
			eventId: event.id,
			pictureId,
			countryId
		},
		{ transaction }
	)
	// if (speaker.picture) {
	// 	speakerSnapshot.setPicture(speaker.picture.id, { transaction })
	// }
	// if (speaker.country) {
	// 	speakerSnapshot.setCountry(speaker.country.id, { transaction })
	// }
	await speakerSnapshot.save()
	return speakerSnapshot
}

async function createVenueSnapshot(
	venue: Venue,
	venueEvent: { [x: string]: any },
	transaction: sequelize.Transaction
) {
	const image = await venue.getPictures()
	const country = await venue.getCountry()
	const region = await venue.getRegion()
	const venueSnapshot = await EventVenue.create(
		{
			status: venueEvent.status,
			name: venueEvent.name,
			city: venueEvent.city,
			address: venueEvent.address,
			location: venueEvent.location,
			email: venueEvent.email,
			description: venueEvent.description,
			venueId: venue.id
		},
		{ transaction }
	)
	if (!venueSnapshot) {
		throw error(HttpResponses.UNIQUE_CONSTRAINT, {
			message: 'Can not create a venue snapshot'
		})
	}

	if(image) {
		venueSnapshot.setPictures(image, { transaction })
	}
	if(country) {
		venueSnapshot.setCountry(country, { transaction })
	}
	if(region) {
		venueSnapshot.setRegion(region, { transaction })
	}
	await venueSnapshot.save({ transaction })
	return venueSnapshot
}
