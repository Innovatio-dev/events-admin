import { HttpResponses } from '$lib/server/constants/httpResponses'
import { User } from '$lib/server/models/user'
import { json, error, type RequestEvent } from '@sveltejs/kit'
import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { checkUser } from '$lib/server/middlewares/permission'

/**
 *
 * @param event
 * @returns User Updated with the role sent
 */
export async function PUT(event: RequestEvent) {
	const logedUser = checkUser(event, User.SUPERADMIN)
	const { id } = event.params
	const { newEmail } = await event.request.json()

	if (!newEmail) {
		throw error(HttpResponses.BAR_REQUEST, {
			message: 'New Email is required'
		})
	}

	try {
		const user = await User.findByPk(id)

		if (!user) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'User with ' + id + ' does not exists'
			})
		}

		const cognito = CognitoFacade.getInstance()
		const result = await cognito.changeUserEmail(user.email, newEmail)

		user.email = newEmail
		await user.save()

		return json(result)
	} catch (err) {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later ' + err
		})
	}
}
