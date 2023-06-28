import { CognitoFacade } from '$lib/server/facades/CognitoFacade';
import { validateBody } from '$lib/server/middlewares/validator';
import { challengeNewPasswordSchema } from '$lib/utils/validation/schemas';
import { json } from '@sveltejs/kit';




export async function POST(event: any) {
	const fields = await validateBody(event, challengeNewPasswordSchema);
	try {
		const cognito = CognitoFacade.getInstance();
		const result = await cognito.challenge(fields.challengeName, fields.session, {
			USERNAME: fields.email,
			NEW_PASSWORD: fields.newPassword
		});
		if (result.ChallengeName) {
			return json({
				challangeName: result.ChallengeName,
				session: result.Session
			});
		}
		const authResult = result.AuthenticationResult;
		if (authResult) {
			return json({
				token: authResult.AccessToken,
				expiresIn: authResult.ExpiresIn
			});
		}
		return json({
			message: 'success'
		});
	} catch (err: any) {
		return json(
			{
				name: err.name || 'Unknown',
				message: err.message
			},
			{
				status: 400
			}
		);
	}
}
