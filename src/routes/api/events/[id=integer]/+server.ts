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
import { Resource } from '$lib/server/models/resource'
import { Country } from '$lib/server/models/country'

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
	const user = checkUser(req)
	const { id } = req.params
	const {
		reason,
		speakers,
		speakersSecondary,
		pictures,
		bannerId,
		bannerMobileId,
		publishingUpdate,
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

		// Just for the status changes
		if (publishingUpdate === true) {
			await event.update({ ...fields }, { transaction })
			await EventLog.create(
				{
					status: event.status,
					reason,
					userId: user.id
				},
				{ transaction }
			)
			event = await Event.scope('full').findByPk(event.id)
			return json({message: 'update from status', event})
		}


		// if (venue.length > 0) {
		const venue = fields.venue
		if (venue) {
			console.log('there is a venue ', venue.name);
			
			// if comes a Venue and its not a copy yet
			// lets search if exists, causes why not
			if (venue.copy === false) {
				const tempVenue = await Venue.findByPk(venue.id)
				if (!tempVenue) {
					throw error(HttpResponses.NOT_FOUND, {
						message: 'Validation Error:  Venue does not exists'
					})
				}
				const eventVenueSnapshot = await createVenueSnapshot(tempVenue, venue, transaction)
				fields.eventVenueId = eventVenueSnapshot.id
				fields.regionId = venue.region.id
				// await event.setVenue(eventVenueSnapshot)
			}
			else {
				const eventVenueSnapshot = await createVenueSnapshot(venue, venue, transaction)
				fields.eventVenueId = eventVenueSnapshot.id
				fields.regionId = venue.region.id
				// await event.setVenue(eventVenueSnapshot)
			}
			
		} else {
			console.log('There is not venue ');
			
			const virtual = await Venue.findOne({
				where: {
					address: 'Online'
				},
				include: [
					{
						model: Region,
						as: 'region'
					},
					{
						model: Resource,
						as: 'pictures'
					},
					{
						model: Country.scope('mini'),
						as: 'country'
					}
				]
			})
			
			if (virtual) {
				console.log('venue to set as zoom');
				virtual.setDataValue('copy', false)
				console.log(virtual.pictures);

				const eventVenueSnapshot = await createVenueSnapshot(virtual, virtual, transaction)
				fields.eventVenueId = eventVenueSnapshot.id
				fields.regionId = virtual.region.id
			}
			else {
				console.log('there is not virtual venue');
			}

		}
		console.log('this are the fields to update', fields);
		
		await event.update({ ...fields }, { transaction })

		let primarySpeakers: EventSpeaker[] = []
		// here goes the speakers
		if (speakers && speakers.length > 0) {
			primarySpeakers = await Promise.all(
				speakers.map((speaker: any, index: number) => {
					createSpeakerSnapshot(speaker, event, true, index, transaction)
				})
			)
		}

		let secondarySpeakers: EventSpeaker[] = []
		if (speakersSecondary && speakersSecondary.length > 0) {
			secondarySpeakers = await Promise.all(
				speakersSecondary.map((speaker: Speaker, index: number) =>
					createSpeakerSnapshot(speaker, event, false, index, transaction)
				)
			)
		}
		
		const allSpeakers = primarySpeakers.concat(secondarySpeakers)
		await event.setEventSpeakers(allSpeakers)

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
				userId: user.id
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
	speaker: any,
	event: Event | null,
	primary: boolean,
	order: number,
	transaction: sequelize.Transaction
) {
	if (!event) {
		return
	}

	const data = {
		status: speaker.status,
		name: speaker.name,
		jobRole: speaker.jobRole,
		company: speaker.company,
		instagram: speaker.instagram,
		linkedin: speaker.linkedin,
		facebook: speaker.facebook,
		youtube: speaker.youtube,
		description: speaker.description,
		primary,
		order,
		eventId: event.id,
		speakerId: speaker.id
	}
	
	if (speaker.copy === true) {
		data.speakerId = speaker.speakerId 
	}

	const speakerSnapshot = await EventSpeaker.create(
		data,
		{ transaction }
	)
	if (speaker.picture) {
		await speakerSnapshot.setPicture(speaker.picture.id, { transaction })
	}
	if (speaker.country) {
		await speakerSnapshot.setCountry(speaker.country.id, { transaction })
	}
	await speakerSnapshot.save()
	
	return speakerSnapshot
}

async function createVenueSnapshot(
	venue: Venue,
	venueEvent: { [x: string]: any },
	transaction: sequelize.Transaction
) {
	// const image = await venue.getPictures()
	// const country = await venue.getCountry()
	// const region = await venue.getRegion()
	const data = {
		status: venueEvent.status,
		name: venueEvent.name,
		city: venueEvent.city,
		address: venueEvent.address,
		location: venueEvent.location,
		email: venueEvent.email,
		description: venueEvent.description,
		venueId: venue.id
	}

	if (venueEvent.copy === true) {
		data.venueId = venueEvent.venueId
	}
	const venueSnapshot = await EventVenue.create(
		data,
		{ transaction }
	)
	await venueSnapshot.setPictures(await venueEvent.pictures.map(e => e.id), { transaction })
	await venueSnapshot.setCountry(venueEvent.country.id, { transaction })
	await venueSnapshot.setRegion(venueEvent.region.id, { transaction })
	await venueSnapshot.save({ transaction })
	return venueSnapshot
}
