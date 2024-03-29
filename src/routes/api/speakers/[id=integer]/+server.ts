import { HttpResponses } from '$lib/server/constants/httpResponses'
import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody } from '$lib/server/middlewares/validator'
import { Speaker } from '$lib/server/models/speaker'
import { User } from '$lib/server/models/user'
import { updateSchema } from '$lib/utils/validation/speakerSchema'
import { error, json, type RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	const { id } = event.params
	const result = await Speaker.scope('full').findByPk(id)

	if (!result) {
		throw error(HttpResponses.NOT_FOUND, { message: 'Speaker not found' })
	}
	return json(result)
}

export async function DELETE(event: RequestEvent) {
	checkUser(event, User.ADMIN)
	const { id } = event.params
	const result = await Speaker.findByPk(id)
	if (!result) {
		throw error(HttpResponses.NOT_FOUND, { message: 'Speaker not found' })
	}
	await result.destroy()
	return json({ message: 'Deleted succesfully' })
}

export async function PUT(event: RequestEvent) {
	checkUser(event, User.ADMIN)
	const { id } = event.params
	const data = await validateBody(event, updateSchema)
	const speaker = await Speaker.findByPk(id)
	if (!speaker) {
		throw error(HttpResponses.NOT_FOUND, { message: 'Speaker not found' })
	}
	await Speaker.update(data, {
		where: { id }
	})
	return json({ message: 'Updated successfully' })
}
