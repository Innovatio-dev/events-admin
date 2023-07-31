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
	const { reason, regions, countryId, ...fields } = await validateBody(
		event,
		updateSchema.keys({
			email: uniqueKeyOf(Organizer, 'email')
		})
	)
	let organizer: Organizer | null = null

	if (fields.status === organizerStatuses.INACTIVE) {
		organizer = await Organizer.findByPk(id, {
			include: [
				{
					model: Event,
					as: 'events'
				}
			]
		})
	} else {
		organizer = await Organizer.findByPk(id)
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
		if (organizer.status === organizerStatuses.INACTIVE) {
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
