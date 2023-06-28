import { COGNITO_APP_CLIENT_ID, COGNITO_USER_POOL_ID } from '$env/static/private'
import type { Handle } from '@sveltejs/kit'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { User } from '../models/user'

export const authHook = async function ({ event, resolve }) {
	let token = event.request.headers.get('authorization')?.split(' ')[1]
	if (!token) {
		token = event.cookies.get('authorization')
	}
	if (token) {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: COGNITO_USER_POOL_ID,
			tokenUse: 'access',
			clientId: COGNITO_APP_CLIENT_ID
		})
		try {
			const payload = await verifier.verify(token)

			const user = await User.findOne({
				where: { cognitoId: payload.sub }
			})
			event.locals.user = user
		} catch (err) {
			event.locals.user = null
			console.log('the provided token is invalid', err)
		}
	}
	return resolve(event)
} satisfies Handle
