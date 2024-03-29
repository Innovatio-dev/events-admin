import { CognitoFacade } from '$lib/server/facades/CognitoFacade'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { User } from '$lib/server/models/user'
import { createSuperAdminSchema } from '$lib/utils/validation/schemas'
import { json, type RequestEvent } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import { checkUser } from '$lib/server/middlewares/permission'
import { filterSchema } from '$lib/utils/validation/eventSchema'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import sequelize from 'sequelize'

/**
 *
 * @param event
 * @returns Admin User List
 */
export async function GET(event: RequestEvent) {
	const logedUser = checkUser(event, User.SUPERADMIN)
	const filter = validateSearchParam(event, filterSchema)
	let where: any = {}

	if (filter.search) {
		// const search = `%${filter.search}%`
		const search = `${filter.search}`
		where = {
			[sequelize.Op.or]: [
				{ name: { [sequelize.Op.iLike]: `%${search}%` } },
				{ surname: { [sequelize.Op.iLike]: `%${search}%` } },
				{ email: { [sequelize.Op.iLike]: `%${search}%` } }
			]
		}
	}

	try {
		const results = await User.scope('list').findAll({
			where,
			limit: filter.limit >= 0 ? filter.limit : undefined,
			offset: filter.offset
		})
		const count = await User.count()
		return json({ count, results })
	} catch (err) {
		console.log(err)
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend try again later'
		})
	}
}

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
