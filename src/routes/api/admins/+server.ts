import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { validateBody } from '$lib/server/middlewares/validator'
import { User } from '$lib/server/models/user'
import { createSuperAdminSchema } from '$lib/utils/validation/schemas'
import { json, type RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import { checkUser } from '$lib/server/middlewares/permission'

/**
 *
 * @param event
 * @returns User Created Super Admin User
 */
export async function POST(event: RequestEvent) {
	const logedUser = checkUser(event, User.SUPERADMIN)
	const fields = await validateBody(event, createSuperAdminSchema)
	try {
		const cognito = CognitoFacade.getInstance()
		const result = await cognito.create(fields.email, fields.password)
		const cognitoUser = result.User
		const user = await User.create({
			cognitoId: cognitoUser.Username,
			name: fields.name,
			surname: fields.surname,
			email: fields.email,
			role: User.SUPERADMIN
		})
		return json(user)
	} catch (err) {
		console.log('error in create')
		console.log(err)
		throw error(409, {
			message: 'User already exists'
		})
	}
}
