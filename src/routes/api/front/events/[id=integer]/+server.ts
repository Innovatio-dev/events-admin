import { HttpResponses } from '$lib/server/constants/httpResponses'
import { eventStatuses } from '$lib/server/constants/statuses'
import { Event } from '$lib/server/models/event'
import { json, type RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	const { id } = event.params
	try {
		const result = await Event.scope('full').findOne({
			where: {
				id: id,
				status: eventStatuses.PUBLISHED
			}
		})

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
