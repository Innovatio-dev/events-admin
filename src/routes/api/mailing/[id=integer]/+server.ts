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

		///

		const defaultClient = SibApiV3Sdk.ApiClient.instance
		const jsonBody = await event.request.json()

		let email = jsonBody.email
		let listId = result.mailing

		if (email === null || listId === null) {
			return json(
				{
					message: 'Event with id ' + id + ' does not exists in our records'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}

		listId = parseInt(listId)

		const apiKey = defaultClient.authentications['api-key']
		apiKey.apiKey = SENDINBLUE_API_KEY

		const apiInstance = new SibApiV3Sdk.ContactsApi()
		const createContact = new SibApiV3Sdk.CreateContact()

		createContact.email = email
		createContact.attributes = {
			EMAIL: email
		}

		if (jsonBody.name) {
			createContact.NOMBRE = jsonBody.name
		}
		if (jsonBody.surname) {
			createContact.APELLIDOS = jsonBody.surname
		}
		if (jsonBody.mavieId) {
			createContact.MAVIEID = jsonBody.mavieId
		}
		if (jsonBody.country) {
			createContact.COUNTRY = jsonBody.country
		}

		//createContact.SIGNUP_DATE = new Date()
		///////
		createContact.listIds = [listId]
		createContact.updateEnabled = true

		try {
			await apiInstance.createContact(createContact)
			return json(
				{
					message: 'Contact email created or updated'
				},
				{
					status: HttpResponses.OK_RESPONSE
				}
			)
		} catch (error) {
			console.log(error)
			return json(
				{
					message: 'Event with id ' + id + ' does not exists in our records'
				},
				{
					status: HttpResponses.NOT_FOUND
				}
			)
		}
		///
	} catch (error) {
		console.log(error)
		throw error
	}
}
