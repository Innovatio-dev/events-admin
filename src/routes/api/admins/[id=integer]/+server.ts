import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { User } from '$lib/server/models/user'
import { json, error, type RequestEvent } from '@sveltejs/kit'
import { CognitoFacade } from '$lib/server/facades/CognitoFacade'

/**
 *
 * @param event
 * @returns User
 */
export async function GET(event: RequestEvent) {
	const { id } = event.params
	// const logedUser = checkUser(event, User.SUPERADMIN)
	try {
		const user = await User.findByPk(id)

		if (!user) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'User with ' + id + ' does not exists'
			})
		}
		return json(user)
	} catch (err) {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later ' + err
		})
	}
}

/**
 *
 * @param event
 * @returns User Updated with the role sent
 */
export async function PUT(event: RequestEvent) {
	// const logedUser = checkUser(event, User.SUPERADMIN)
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

/**
 *
 * @param event
 * @returns User Updated with the role sent
 */
export async function DELETE(event: RequestEvent) {
	// const logedUser = checkUser(event, User.SUPERADMIN)
	const { id } = event.params
	try {
		const user = await User.findByPk(id)
		const cognito = CognitoFacade.getInstance()

		if (!user) {
			throw error(HttpResponses.NOT_FOUND, {
				message: 'User with ' + id + ' does not exists'
			})
		}
		const response = await cognito.deleteUser(user.email)
		await user.destroy()
		return json(response)
	} catch (err) {
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later ' + err
		})
	}
}
