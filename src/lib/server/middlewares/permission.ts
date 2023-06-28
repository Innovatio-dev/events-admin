import { error, type RequestEvent } from '@sveltejs/kit'
import { User } from '../models/user'

export function checkUser(event: RequestEvent, role: number | null = null) {
	const user = event.locals.user
	if (!user) {
		throw error(401, {
			message:
				'You need to send a valid authorization token in order to request this endpoint'
		})
	}
	if (role !== null && role !== user.role && user.role != User.SUPERADMIN) {
		throw error(401, 'Your user does not have the correct role to do this operation')
	}
	return user
}
