import {
	AS_ACCESS_KEY_ID,
	AS_SECRET_ACCESS_KEY,
	COGNITO_APP_CLIENT_ID,
	COGNITO_USER_POOL_ID,
	AS_REGION,
	SECRET_HASH
} from '$env/static/private'

// import provider from "@aws-sdk/client-cognito-identity-provider";
import {
	CognitoIdentityProviderClient,
	AdminDeleteUserCommand,
	AdminGetUserCommand,
	InitiateAuthCommand,
	AdminCreateUserCommand,
	ConfirmSignUpCommand,
	RespondToAuthChallengeCommand,
	AdminSetUserPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider'

export class CognitoFacade {
	private readonly client: CognitoIdentityProviderClient
	private readonly userPoolId: string
	private readonly clientId: string
	private readonly secretHash: string
	private static singleton: CognitoFacade | null

	constructor(
		region: string,
		userPoolId: string,
		clientId: string,
		secretHash: string,
		accessKeyId: string,
		secretAccessKey: string
	) {
		this.client = new CognitoIdentityProviderClient({
			region,
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey
			}
		})

		this.userPoolId = userPoolId
		this.clientId = clientId
		this.secretHash = secretHash
	}

	static getInstance(): CognitoFacade {
		if (!CognitoFacade.singleton) {
			CognitoFacade.singleton = new CognitoFacade(
				AS_REGION,
				COGNITO_USER_POOL_ID,
				COGNITO_APP_CLIENT_ID,
				SECRET_HASH,
				AS_ACCESS_KEY_ID,
				AS_SECRET_ACCESS_KEY
			)
		}
		return CognitoFacade.singleton as CognitoFacade
	}

	async deleteUser(username: string): Promise<any> {
		try {
			const command = new AdminDeleteUserCommand({
				UserPoolId: this.userPoolId,
				Username: username
			})
			const response = await this.client.send(command)
			return response
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	async getUser(username: string): Promise<any> {
		try {
			const command = new AdminGetUserCommand({
				UserPoolId: this.userPoolId,
				Username: username
			})
			const response = await this.client.send(command)
			return response
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	async signup(email: string, password: string): Promise<any> {
		try {
			const command = new InitiateAuthCommand({
				ClientId: this.clientId,
				AuthFlow: 'USER_PASSWORD_AUTH',
				AuthParameters: {
					Username: email,
					Password: password
				}
			})
			const response = await this.client.send(command)
			return response
		} catch (error) {
			console.error(error)
			throw error
		}
	}
	async create(email: string, password: string): Promise<any> {
		try {
			const command = new AdminCreateUserCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				TemporaryPassword: password,
				DesiredDeliveryMediums: ['EMAIL'],
				UserAttributes: [{ Name: 'email', Value: email }]
			})
			const response = await this.client.send(command)
			return response
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	async confirmUser(email: string, confirmationCode: string): Promise<any> {
		try {
			const command = new ConfirmSignUpCommand({
				ClientId: this.clientId,
				SecretHash: this.secretHash,
				Username: email,
				ConfirmationCode: confirmationCode
			})
			const response = await this.client.send(command)
			return response
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	async signin(email: string, password: string): Promise<any> {
		const command = new InitiateAuthCommand({
			ClientId: this.clientId,
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				USERNAME: email,
				PASSWORD: password,
				DEVICE_KEY: 'Desktop'
			}
		})
		const response = await this.client.send(command)
		return response
	}

	async changeUserPassword(email: string, password: string) {
		const command = new AdminSetUserPasswordCommand({
			UserPoolId: this.userPoolId,
			Username: email,
			Password: password,
			Permanent: true
		})

		return await this.client.send(command)
	}

	async challenge(
		challengeName: string,
		session: string,
		challengeResponses: Record<string, string>
	) {
		const command = new RespondToAuthChallengeCommand({
			ClientId: this.clientId,
			ChallengeName: challengeName,
			Session: session,
			ChallengeResponses: challengeResponses
		})
		return await this.client.send(command)
	}
}
