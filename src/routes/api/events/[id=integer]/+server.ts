import { getConnection } from '$lib/server/config/database'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody } from '$lib/server/middlewares/validator'
import { Event } from '$lib/server/models/event'
import { EventLog } from '$lib/server/models/eventLog'
import { updateSchema } from '$lib/utils/validation/eventSchema'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import type sequelize from 'sequelize'
import type { Speaker } from '$lib/server/models/speaker'
import { EventSpeaker } from '$lib/server/models/eventSpeaker'
import { EventVenue } from '$lib/server/models/eventVenue'
import { Venue } from '$lib/server/models/venue'
import { Region } from '$lib/server/models/region'

export async function GET(event: RequestEvent) {
	const { id } = event.params
	try {
		const result = await Event.scope('full').findByPk(id)

		if (!result) {
			return json(
				{
					message: 'Event with id ' + id + ' does not exists in our records'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}
		return json(result)
	} catch (error) {
		console.log(error)
		throw error
	}
}

export async function PUT(req: RequestEvent) {
	// const user = checkUser(req)
	const { id } = req.params
	const {
		reason,
		speakers,
		speakersSecondary,
		pictures,
		bannerId,
		bannerMobileId,
		venue,
		...fields
	} = await validateBody(req, updateSchema)

	let event: Event | null

	const connection = await getConnection()
	const transaction = await connection.transaction()
	try {
		event = await Event.findByPk(id, { transaction })

		if (event == null) {
			throw error(404, {
				message: 'Event with id ' + id + ' does not exist in our records'
			})
		}

		await event.update({ ...fields }, { transaction })

		if (venue.length > 0) {
			const tempVenue = await Venue.findByPk(venue[0].id)
			if (!tempVenue) {
				throw error(HttpResponses.NOT_FOUND, {
					message: 'Validation Error:  Venue does not exists'
				})
			}
			const eventVenueSnapshot = await createVenueSnapshot(tempVenue, venue[0], transaction)
			fields.eventVenueId = eventVenueSnapshot.id
			fields.regionId = venue[0].region.id
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
				fields.venueId = virtual.id
				fields.regionId = virtual.region.id
			}
		}

		// here goes the speakers
		if (speakers && speakers.length > 0) {
			const snapshotSpeakers = await Promise.all(
				speakers.map((speaker: Speaker, index: number) =>
					createSpeakerSnapshot(speaker, event, true, index, transaction)
				)
			)
			await event.setEventSpeakers(snapshotSpeakers)
		}

		// speakersMap = []
		if (speakersSecondary && speakersSecondary.length > 0) {
			const snapshotSpeakers = await Promise.all(
				speakersSecondary.map((speaker: Speaker, index: number) =>
					createSpeakerSnapshot(speaker, event, false, index, transaction)
				)
			)
			await event.setEventSpeakers(snapshotSpeakers)
		}
		// -- end here goes the speakers

		if (pictures) {
			await event.setPictures(pictures, { transaction })
		}

		if (bannerId) {
			await event.setBanner(bannerId, { transaction })
		}
		if (bannerMobileId) {
			await event.setBanner(bannerMobileId, { transaction })
		}
		await EventLog.create(
			{
				status: event.status,
				reason,
				// userId: user.id
				userId: 1
			},
			{ transaction }
		)

		await transaction.commit()
		event = await Event.scope('full').findByPk(event.id)
		return json(event)
	} catch (err: any) {
		// Si ocurre algún err, deshacer la transacción
		await transaction.rollback()
		console.log(err)
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
	event: Event | null,
	primary: boolean,
	order: number,
	transaction: sequelize.Transaction
) {
	if (!event) {
		return
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
			speakerId: speaker.speakerId,
			primary,
			order,
			eventId: event.id
		},
		{ transaction }
	)
	if (speaker.picture) {
		speakerSnapshot.setPicture(speaker.picture.id, { transaction })
	}
	if (speaker.countryId) {
		speakerSnapshot.setCountry(speaker.countryId, { transaction })
	}
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
	venueSnapshot.setPictures(image, { transaction })
	venueSnapshot.setCountry(country, { transaction })
	venueSnapshot.setRegion(region, { transaction })
	await venueSnapshot.save({ transaction })
	return venueSnapshot
}
