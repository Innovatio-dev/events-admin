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
	const { picture } = await event.request.json()
	const data = await validateBody(event, updateSchema)
	const speaker = await Speaker.findByPk(id)
	if (!speaker) {
		throw error(HttpResponses.NOT_FOUND, { message: 'Speaker not found' })
	}
	data.countryId = data.country.id
	data.pictureId = speaker.pictureId

	if (picture && picture.length > 0) {
		data.pictureId = picture[0]
	}

	await Speaker.update(data, {
		where: { id }
	})
	const result = await Speaker.scope('full').findOne({
		where: {
			id
		}
	})
	return json(result)
}
