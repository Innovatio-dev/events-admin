import { HttpResponses } from '$lib/server/constants/httpResponses'
import { OrganizerRequestLog } from '$lib/server/models/requestLog'
import { error, json, type RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	const { id, logId } = event.params

	try {
		const result = await OrganizerRequestLog.findOne({
			where: {
				id: logId,
				organizerRequestId: id
			}
		})
		if (!result) {
			return json(
				{
					message: 'Organizer Request log does not found'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}
		return json(result)
	} catch (errr) {
		console.log(errr)
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend, try again later'
		})
	}
}

export async function DELETE(event: RequestEvent) {
	const { logId } = event.params
	try {
		const result = await OrganizerRequestLog.findByPk(logId)
		if (!result) {
			return json(
				{
					message: 'Organizer Request Log deleted'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}
		OrganizerRequestLog.destroy({
			where: {
				id: result.id
			}
		})
		return json(
			{},
			{
				status: HttpResponses.NO_RESPONSE
			}
		)
	} catch {
		throw error(HttpResponses.NOT_FOUND, {
			message: 'Organizer Request Log with ' + logId + ' does not exists'
		})
	}
}
