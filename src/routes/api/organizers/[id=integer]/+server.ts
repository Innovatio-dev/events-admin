import { getConnection } from '$lib/server/config/database'
import { eventStatuses, organizerStatuses } from '$lib/server/constants/statuses'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody } from '$lib/server/middlewares/validator'
import { Event } from '$lib/server/models/event'
import { Organizer } from '$lib/server/models/organizer'
import { OrganizerLog } from '$lib/server/models/organizerLog'
import { deleteSchema, updateSchema } from '$lib/utils/validation/organizerSchema'
import { uniqueKeyOf } from '$lib/server/validation/schemas'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import { sendEmail } from '$lib/utils/brevo/sendMail'

export async function GET(event: RequestEvent) {
	const { id } = event.params
	const result = await Organizer.scope('full').findByPk(id)
	if (result == null) {
		throw error(404, {
			message: 'Organizer with id ' + id + ' does not exists in our records'
		})
	}
	return json(result)
}

export async function PUT(event: RequestEvent) {
	const user = checkUser(event)
	const { id } = event.params
	const { reason, regions, countryId, logo, ...fields } = await validateBody(
		event,
		updateSchema.keys({
			email: uniqueKeyOf(Organizer, 'email')
		})
	)
	let organizer: Organizer | null = null

	if (fields.status === organizerStatuses.SUSPENDED) {
		organizer = await Organizer.findByPk(id, {
			include: [
				{
					model: Event,
					as: 'events'
				}
			]
		})
		const emailData = {
			subject: 'Important Update on Your MaVie Organizer Status',
			name: organizer?.name,
			email: organizer?.email,
			reason: organizer?.reason,
			templateId: 4,
			content: `<html>
			<body>
				<h1>Dear {{params.name}}</h1><br/>
				<p>We hope this message finds you well. We are reaching out to inform you that, following a thorough review, your status as a MaVie Organizer has been temporarily suspended.</p><br/>
				<p>Reason:</p><br/>
				<p>{{params.reason}}</p><br/>
				<p>We understand the implications of this decision, and it wasn't made lightly. To move forward, please carefully consider the feedback provided. If you wish to be reinstated, you will need to address the reasons for suspension and demonstrate alignment with our platform's guidelines.</p><br/>
				<p>For further questions or clarification, feel free to reply to this email or write us on whatsapp. We're here to assist and guide you through this process.</p><br/>
				<p>Warmly,The MaVie Team</p>
			</body>
		</html>`
		}
		sendEmail(emailData)
	} else {
		organizer = await Organizer.findByPk(id)
		const emailData = {
			subject: 'Welcome Back: Your Organizer Status is Reinstated!',
			name: organizer?.name,
			email: organizer?.email,
			reason: organizer?.reason,
			templateId: 3,
			content: `<html>
			<body>
				<h1>Dear {{params.name}}</h1><br/>
				<p>We hope this message finds you well. We are reaching out to inform you that, following a thorough review, your status as a MaVie Organizer has been temporarily suspended.</p><br/>
				<p>Reason:</p><br/>
				<p>{{params.reason}}</p><br/>
				<p>We understand the implications of this decision, and it wasn't made lightly. To move forward, please carefully consider the feedback provided. If you wish to be reinstated, you will need to address the reasons for suspension and demonstrate alignment with our platform's guidelines.</p><br/>
				<p>For further questions or clarification, feel free to reply to this email or write us on whatsapp. We're here to assist and guide you through this process.</p><br/>
				<p>Warmly,The MaVie Team</p>
			</body>
		</html>`
		}
		sendEmail(emailData)
	}
	const connection = await getConnection()
	if (organizer == null) {
		throw error(404, {
			message: 'Organizer with id ' + id + ' does not exist in our records'
		})
	}

	// Iniciar una transacción
	const transaction = await connection.transaction()
	try {
		fields.logoId = organizer.logoId
		if (logo && logo.length > 0) {
			fields.logoId = logo[0]
		}
		// Actualizar el organizador con los campos proporcionados, excluyendo el campo 'region'
		await organizer.update({ ...fields }, { transaction })

		// Actualizar la relación muchos a muchos 'Region' del organizador
		if (regions) {
			await organizer.setRegions(regions, { transaction })
		}

		if (countryId) {
			await organizer.setCountry(countryId, { transaction })
		}

		// En caso de que el organizador esté inactivo, cancelar todos sus eventos
		if (organizer.status === organizerStatuses.SUSPENDED) {
			organizer.events.forEach(async (element: Event) => {
				element.status = eventStatuses.CANCELLED
				await element.save()
			})
		}
		await OrganizerLog.create(
			{
				status: organizer.status,
				reason,
				organizerId: organizer.id,
				userId: user.id
			},
			{ transaction }
		)
		// Confirmar la transacción
		await transaction.commit()
		// Recargar el organizador para obtener los cambios actualizados
		organizer = await Organizer.scope('full').findByPk(organizer.id)
		return json(organizer)
	} catch (error) {
		// Si ocurre algún error, deshacer la transacción
		await transaction.rollback()
		throw error
	}
}

export async function DELETE(event: RequestEvent) {
	const user = checkUser(event)
	const { id } = event.params
	const { reason } = await validateBody(event, deleteSchema)
	const organizer = await Organizer.findByPk(id)
	if (organizer == null) {
		throw error(404, {
			message: 'Organizer with id ' + id + ' does not exists in our records'
		})
	}
	await organizer.destroy()
	await OrganizerLog.create({
		status: Organizer.STATUS_INACTIVE,
		reason,
		organizerId: organizer.id,
		userId: user.id
	})
	return json({ message: 'Deleted succesfully' })
}
