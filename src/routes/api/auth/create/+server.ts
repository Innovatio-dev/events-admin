import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { validateBody } from '$lib/server/middlewares/validator'
import { User } from '$lib/server/models/user'
import { createUserSchema } from '$lib/utils/validation/schemas'
import { json, type RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'

export async function POST(event: RequestEvent) {
	const fields = await validateBody(event, createUserSchema)
	try {
		const cognito = CognitoFacade.getInstance()
		const result = await cognito.create(fields.email, fields.password)
		const cognitoUser = result.User
		const user = await User.create({
			cognitoId: cognitoUser.Username,
			name: fields.name,
			surname: fields.surname,
			email: fields.email,
			role: fields.role
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
