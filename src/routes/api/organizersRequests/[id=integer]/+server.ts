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
import { Region } from '$lib/server/models/region'
import { sendEmail } from '$lib/utils/brevo/sendMail'

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
		throw error(HttpResponses.NOT_FOUND, {
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
	// const user = checkUser(event, User.ADMIN)

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
		const virtual = await Region.findOne({
			where: {
				name: 'Virtual'
			}
		})

		if (!virtual) {
			throw error(HttpResponses.BAD_REQUEST, {
				message: 'There must be a region on the db to fill the virtual'
			})
		}

		let typeEvent = Organizer.TYPE_EVENT_LIVE
		const regions = (await organizerRequest.getRegions()).map((region) => region.id)
		if (regions.length > 1 && regions.includes(virtual.id)) {
			typeEvent = Organizer.TYPE_EVENT_BOTH
		} else if (regions.length === 1 && regions.includes(8)) {
			typeEvent = Organizer.TYPE_EVENT_VIRTUAL
		}

		// Create a new organizer
		newOrganizer = await Organizer.create({
			status: organizerStatuses.ACTIVE,
			typeEvent,
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
		const emailData = {
			subject: 'Congratulations! You&apos;re Now a MaVie Organizer',
			name: organizerRequest.name,
			email: organizerRequest.email,
			templateId: 3,
			content: `<html>
				<body>
					<h1>Dear {{params.name}}</h1><br/>
					<p>We are thrilled to inform you that after a thorough review, your application to become a MaVie Organizer has been approved! Welcome to our community of elite organizers.</p><br/>
					<p><strong>Connect with Our Team on WhatsApp!</stong></p><br/>
					<p>To kickstart your journey, we'd love for you to connect with our team directly via Business WhatsApp. This will be your primary channel for event proposals, discussions, and more.</p><br/>
					<p>All your event proposals and discussions will be managed through this platform to ensure efficient and direct communication.</p><br/>
					<p>Once again, congratulations on joining MaVie! We're excited to see the fantastic events you'll bring to our platform.</p><br/>
					<p>If you have any questions or need further clarification on any aspect, do not hesitate to reach out on whatsapp or here.</p><br/>
					<p>We're here to help and guide you every step of the way.</p><br/>	
					<p>Warm regards,</p><br/>	
					<p>The MaVie Team</p>	
				</body>
			</html>`
		}
		sendEmail(emailData)
		newOrganizer.setRegions(regions)
	} else if (data.status === organizerRequestStatuses.DENIED) {
		const emailData = {
			name: organizerRequest.name,
			email: organizerRequest.email,
			reason: organizerRequest.reason,
			subject: 'MaVie Organizer Application Update',
			templateId: 4,
			content: `<html>
					<body>
						<h1>Dear {{params.name}}</h1><br/>
						<p>Thank you for applying to be a MaVie Organizer.</p><br/>
						<p>Regrettably, after our review, we can't proceed with your application at this time.</p><br/>
						<p>Reason:</p><br/>
						<p>{{params.reason}}</p><br/>
						<p>To move forward, kindly review the feedback provided, make necessary adjustments, and re-apply using our application form. Your understanding and proactive approach will be valuable in future considerations.</p><br/>
						<p>If you have further questions or need clarification, please reply to this email.</p><br/>
						<p>Warm regards,</p><br/>
						<p>The MaVie Team</p>
					</body>
				</html>`
		}

		sendEmail(emailData)
	}
	organizerRequest.status = data.status
	await organizerRequest.save()
	const log = await OrganizerRequestLog.create({
		status: data.status,
		reason: data.reason,
		organizerRequestId: organizerRequest.id,
		userId: 1
	})
	return json(log)
}
