import { getConnection } from '$lib/server/config/database'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody } from '$lib/server/middlewares/validator'
import { Event } from '$lib/server/models/event'
import { EventLog } from '$lib/server/models/eventLog'
import { updateSchema } from '$lib/utils/validation/eventSchema'
import { error, json, type RequestEvent } from '@sveltejs/kit'

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
	const { reason, pictures, bannerId, bannerMobileId, ...fields } = await validateBody(
		req,
		updateSchema
	)
	let event = await Event.findByPk(id)
	const connection = await getConnection()
	if (event == null) {
		throw error(404, {
			message: 'Event with id ' + id + ' does not exist in our records'
		})
	}

	const transaction = await connection.transaction()
	try {
		await event.update({ ...fields }, { transaction })

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
	} catch (error) {
		// Si ocurre algún error, deshacer la transacción
		await transaction.rollback()
		console.log(error)
		throw error
	}
}
