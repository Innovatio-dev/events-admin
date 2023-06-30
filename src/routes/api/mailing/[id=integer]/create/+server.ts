import { HttpResponses } from '$lib/server/constants/httpResponses'
import { Event } from '$lib/server/models/event'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import { SENDINBLUE_API_KEY } from '$env/static/private'
import SibApiV3Sdk from 'sib-api-v3-sdk'

export async function POST(event: RequestEvent) {
	const { id } = event.params
	try {
		const result = await Event.scope('full').findByPk(id)

		if (!result) {
			return json(
				{
					message: 'Event with id ' + id + ' does not exists in our records'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}

		let defaultClient = SibApiV3Sdk.ApiClient.instance
		let apiKey = defaultClient.authentications['api-key']
		apiKey.apiKey = SENDINBLUE_API_KEY

		let apiInstance = new SibApiV3Sdk.ContactsApi()
		let createList = new SibApiV3Sdk.CreateList()

		createList.name = result.title
		createList.folderId = 5

		const data = await apiInstance.createList(createList)
		result.mailing = data.id
		await result.save()
		return json(result)
		///
	} catch (error) {
		console.log(error)
		throw error
	}
}
