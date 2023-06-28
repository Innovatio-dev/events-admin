import { redirect } from '@sveltejs/kit'

export async function load(event) {
	const user = event.locals.user
	if (!user) {
		if (!event.url.pathname.startsWith('/signin')) {
			throw redirect(302, `/signin?redirect=${encodeURIComponent(event.url.pathname)}`)
		}
		return { user: null }
	}
	return {
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
			surname: user.surname
		}
	}
}
