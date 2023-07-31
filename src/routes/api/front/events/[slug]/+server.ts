import { HttpResponses } from '$lib/server/constants/httpResponses'
import { eventStatuses } from '$lib/server/constants/statuses'
import { Event } from '$lib/server/models/event'
import { json, type RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	const { slug } = event.params

	const result = await Event.scope('web').findOne({
		where: {
			slug: slug,
			status: eventStatuses.PUBLISHED
		}
	})

	if (!result) {
		return json(
			{
				message: 'Event with slug ' + slug + ' does not exists in our records'
			},
			{
				status: HttpResponses.NOT_FOUND
			}
		)
	}

	return json(result)
}
