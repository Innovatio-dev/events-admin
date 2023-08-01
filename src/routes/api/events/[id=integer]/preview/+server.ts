import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { Event } from '$lib/server/models/event'
import { json, type RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	const user = checkUser(event)
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
