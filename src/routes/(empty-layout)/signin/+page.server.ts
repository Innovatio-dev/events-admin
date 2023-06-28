import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit'
const homePath = '/organizers'

export const actions: Actions = {
	make: async (event: RequestEvent) => {
		const data = await event.request.formData()
		const email = data.get('email')
		const password = data.get('password')
		const res = await event.fetch('/api/auth/signin', {
			method: 'post',
			body: JSON.stringify({ email, password })
		})
		const auth = await res.json()
		if (!res.ok) {
			return fail(res.status, {
				email,
				error: auth
			})
		}

		if (auth.challengeName) {
			return {
				email,
				redirectTo: event.url.searchParams.get('redirect') ?? homePath,
				challenge: auth
			}
		}

		event.cookies.set('authorization', auth.token, {
			httpOnly: true,
			maxAge: auth.expiresIn,
			path: '/'
		})
		const path = event.url.searchParams.get('redirect') ?? homePath
		throw redirect(302, path)
	},
	new_password: async (event: RequestEvent) => {
		const data = await event.request.formData()
		const newPassword = data.get('newPassword')
		const newPasswordConfirmation = data.get('newPasswordConfirmation')
		const session = data.get('session')
		const email = data.get('email')
		const redirectTo = data.get('redirectTo')
		const challengeName = 'NEW_PASSWORD_REQUIRED'
		const body = JSON.stringify({
			challengeName,
			session,
			email,
			newPassword,
			newPasswordConfirmation
		})
		console.log(body)
		const res = await event.fetch('/api/auth/challenge', {
			method: 'post',
			body
		})
		const auth = await res.json()
		if (!res.ok) {
			return fail(400, {
				error: auth,
				email,
				redirectTo,
				challenge: {
					challengeName,
					session
				}
			})
		}
		if (auth.challengeName) {
			return {
				email,
				redirectTo,
				challenge: auth
			}
		}
		event.cookies.set('authorization', auth.token, {
			httpOnly: true,
			maxAge: auth.expiresIn,
			path: '/'
		})
		const path = redirectTo?.toString() ?? homePath
		throw redirect(302, path)
	}
}

export const load = async (event) => {
	const user = event.locals.user
	const redirectTo = event.url.searchParams.get('redirect') ?? homePath

	if (user) {
		throw redirect(302, redirectTo)
	}
}
