import { HttpResponses } from '$lib/server/constants/httpResponses'
import { Event } from '$lib/server/models/event'
import { Mailing } from '$lib/server/models/mailing'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import { SENDINBLUE_API_KEY } from '$env/static/private'
import SibApiV3Sdk from 'sib-api-v3-sdk'
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'
import Joi from 'joi'
import { validateSearchParam } from '$lib/server/middlewares/validator'

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

		const email = jsonBody.email
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

		const mailinig = await Mailing.create({
			email: jsonBody.email,
			name: jsonBody.name,
			surname: jsonBody.surname,
			mavieId: jsonBody.mavieId,
			country: jsonBody.country,
			eventId: result.id
		})

		//createContact.SIGNUP_DATE = new Date()
		///////
		createContact.listIds = [listId]
		createContact.updateEnabled = true

		try {
			await apiInstance.createContact(createContact)
			return json(
				{
					message: 'Contact email created or updated',
					mailinig
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

const schema = Joi.object({
	export: Joi.boolean().default(false)
})
export async function GET(event: RequestEvent) {
	const { id } = event.params
	const filter = validateSearchParam(event, schema)

	try{
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

		const results = await result.getMailings()
	
		if (filter.export) {

			if(results.length === 0) {
				return json( {
					message: 'This mailing list its empty, it can not be written'
				}, {
					status: HttpResponses.EMPTY_OBJECT_OR_LIST
				})
			}
			const opts = {}
			const parser = new Parser(opts)
	
			const S3 = new AWS.S3({
				accessKeyId: AS_ACCESS_KEY_ID,
				secretAccessKey: AS_SECRET_ACCESS_KEY,
				region: AS_REGION
			})
	
			const mailings: Array<string | any> = []
			for (const iterator of results) {
				mailings.push({
					email: iterator.email,
					name: iterator.name,
					surname: iterator.surname,
					mavieId: iterator.mavieId,
					country: iterator.country
				})
			}

			const csv = parser.parse(mailings)
	
			const data = {
				Bucket: s3BucketName,
				Key: `data/dumpdata_suscribers_${result.id}.csv`,
				Body: csv,
				ContentEncoding: 'base64'
			}
	
			S3.upload(data, function (err, data) {
				if (err) {
					console.log(err)
					console.log('Error uploading data')
				} else {
					console.log('succesfully uploaded!!!')
				}
			})
	
			return json({
				results,
				formedUrl: `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/data/dumpdata_suscribers_${result.id}.csv`,
			})
		}

		return json(
			{
				results
			},
			{
				status: HttpResponses.OK_RESPONSE
			}
		)
	} catch(err: any)  {
		console.log(err)
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend, error: '+ err
		})
	}
}