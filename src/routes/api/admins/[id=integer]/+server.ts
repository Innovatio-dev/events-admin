import { HttpResponses } from '$lib/server/constants/httpResponses'
import { User } from '$lib/server/models/user'
import { json, error, type RequestEvent } from '@sveltejs/kit'

export async function PUT(event: RequestEvent) {
	const { id } = event.params
	const { role } = await event.request.json()
	try {
		const user = await User.findByPk(id)

		if (!user) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'User with ' + id + ' does not exists'
			})
		}
		user.role = role

		await user.save()
		return json(user)
	} catch (err) {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later ' + err
		})
	}
}
