import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { validateBody } from '$lib/server/middlewares/validator'
import { signinSchema } from '$lib/utils/validation/schemas'
import { json } from '@sveltejs/kit'

export async function POST(event: any) {
	const fields = await validateBody(event, signinSchema)
	try {
		const cognito = CognitoFacade.getInstance()
		const result = await cognito.signin(fields.email, fields.password)
		if (result.ChallengeName) {
			return json({
				challengeName: result.ChallengeName,
				session: result.Session
			})
		}
		const authResult = result.AuthenticationResult
		return json({
			token: authResult.AccessToken,
			expiresIn: authResult.ExpiresIn
		})
	} catch (err) {
		console.log(err)
		return json(
			{
				message: 'Invalid user or password'
			},
			{
				status: 401
			}
		)
	}
}
