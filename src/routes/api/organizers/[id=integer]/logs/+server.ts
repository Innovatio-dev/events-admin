import { Organizer } from '$lib/server/models/organizer'
import { OrganizerLog } from '$lib/server/models/organizerLog'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import { User } from '$lib/server/models/user'

export async function GET(event: RequestEvent) {
	const { id } = event.params
	const result = await Organizer.findByPk(id)
	if (result == null) {
		throw error(404, {
			message: 'Organizer with id ' + id + ' does not exists in our records'
		})
	}

	const results = await OrganizerLog.findAll({
		where: {
			organizerId: result.id
		},
		include: [
			{
				model: User.scope('list'),
				as: 'user'
			}
		]
	})
	return json(results)
}
