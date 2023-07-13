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
	const { newPassword } = await event.request.json()
	try {
		const user = await User.findByPk(id)

		if (!user) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'User with ' + id + ' does not exists'
			})
		}

		const cognito = CognitoFacade.getInstance()
		const result = await cognito.changeUserPassword(user.email, newPassword)

		return json(result)
	} catch (err) {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later ' + err
		})
	}
}
