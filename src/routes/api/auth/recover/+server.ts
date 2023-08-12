import { HttpResponses } from '$lib/server/constants/httpResponses'
import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { User } from '$lib/server/models/user'
import { json, type RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'

export async function POST(event: RequestEvent) {
	// const fields = await validateBody(event, createUserSchema)
	const { email } = await event.request.json()
	try {
		const cognito = CognitoFacade.getInstance()
		const user = await User.findOne({
			where: {
				email
			}
		})
		if (!user) {
			return json(
				{
					message: 'User with email ' + email + ' does not exists in our records'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}

		const result = await cognito.recoverPassword(user.email)
		
		return json(result)
	} catch (err) {
		console.log('error in recover password')
		console.log(err)
		throw error(409, {
			message: 'We can not recover your password at the moment'
		})
	}
}
