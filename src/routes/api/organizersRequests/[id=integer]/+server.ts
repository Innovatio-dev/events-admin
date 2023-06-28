import { OrganizerRequest } from '$lib/server/models/request'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import Joi from 'joi'
import { organizerRequestStatuses, organizerStatuses } from '$lib/server/constants/statuses'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { Organizer } from '$lib/server/models/organizer'
import { OrganizerRequestLog } from '$lib/server/models/requestLog'
import { checkUser } from '$lib/server/middlewares/permission'
import { User } from '$lib/server/models/user'
import { validateBody } from '$lib/server/middlewares/validator'

export async function GET(event: RequestEvent) {
	const { id } = event.params

	try {
		const result = await OrganizerRequest.scope('full').findByPk(id)
		if (!result) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'Organizer Request with id ' + id + ' does not exists'
			})
		}
		return json(result)
	} catch {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Organizer Request with id ' + id + ' does not exists'
		})
	}
}

export async function DELETE(event: RequestEvent) {
	checkUser(event, User.SUPERADMIN)
	const { id } = event.params
	try {
		const result = await OrganizerRequest.findByPk(id)
		if (!result) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'Organizer Request with ' + id + ' does not exists'
			})
		}
		OrganizerRequest.destroy({
			where: {
				id: result.id
			}
		})
		return json({
			message: 'Organizer Reques deleted'
		})
	} catch {
		throw error(HttpResponses.NOT_FOUND, {
			message: 'Organizer Request with ' + id + ' does not exists'
		})
	}
}

const putSchema = Joi.object({
	status: Joi.number().min(1).max(2).required(),
	reason: Joi.string().min(5).required()
})

export async function PUT(event: RequestEvent) {
	const data = await validateBody(event, putSchema)
	const user = checkUser(event, User.ADMIN)

	const { id } = event.params
	let newOrganizer: Organizer | null = null
	const organizerRequest = await OrganizerRequest.findByPk(id)
	if (!organizerRequest) {
		throw error(HttpResponses.NOT_FOUND, {
			message: 'Organizer Request with id ' + id + ' does not exists'
		})
	}

	if (organizerRequest.status !== organizerRequestStatuses.PENDING) {
		throw error(HttpResponses.BAD_REQUEST, {
			message: 'Only requests with pending status can be changed'
		})
	}
	if (data.status == organizerRequestStatuses.PENDING) {
		throw error(HttpResponses.BAD_REQUEST, {
			message: 'Request only can ben changed to APPROVED or DENIED'
		})
	}
	// update the request status

	if (data.status === organizerRequestStatuses.APPROVED) {
		//Check if organizer with provided email does not exist in database
		newOrganizer = await Organizer.findOne({ where: { email: organizerRequest.email } })
		if (newOrganizer != null) {
			throw error(HttpResponses.BAD_REQUEST, {
				message: 'Organizer request has an email already taken'
			})
		}
		// Create a new organizer
		newOrganizer = await Organizer.create({
			status: organizerStatuses.ACTIVE,
			name: organizerRequest.name,
			company: organizerRequest.company,
			country: organizerRequest.country,
			city: organizerRequest.city,
			email: organizerRequest.email,
			phone: organizerRequest.phone,
			website: organizerRequest.website,
			twitter: organizerRequest.twitter,
			facebook: organizerRequest.facebook,
			instagram: organizerRequest.instagram,
			linkedin: organizerRequest.linkedin,
			youtube: organizerRequest.youtube,
			mavieId: organizerRequest.mavieId,
			description: organizerRequest.description,
			countryId: organizerRequest.countryId,
			dateOfRequest: organizerRequest.createdAt
		})
		const regions = (await organizerRequest.getRegions()).map((region) => region.id)
		newOrganizer.setRegions(regions)
	} else if (data.status === organizerRequestStatuses.DENIED) {
		//TODO: Send email with reason of denied
	}
	organizerRequest.status = data.status
	await organizerRequest.save()
	const log = await OrganizerRequestLog.create({
		status: data.status,
		reason: data.reason,
		organizerRequestId: organizerRequest.id,
		userId: user.id
	})
	return json(log)
}
