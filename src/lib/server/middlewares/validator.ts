import type { ObjectSchema } from 'joi'
import { error as Error, type RequestEvent } from '@sveltejs/kit'
export function validate(fields: any, schema: ObjectSchema) {
	const { error, value } = schema.validate(fields, {
		abortEarly: false,
		allowUnknown: true
	})
	if (error) {
		const details = {
			message: 'Validation error',
			details: error.details
		}
		throw Error(400, details)
	}
	return value
}

export async function validateAsync(fields: any, schema: ObjectSchema) {
	try {
		const value = await schema.validateAsync(fields, { abortEarly: false, allowUnknown: true })
		return value
	} catch (error) {
		const details = {
			message: 'Validation error',
			details: error.details
		}
		throw Error(400, details)
	}
}

export function validateSearchParam(event: RequestEvent, schema: ObjectSchema) {
	const result: any = {}
	const searchParams = event.url.searchParams
	for (const [key, value] of searchParams.entries()) {
		result[key] = value
	}
	return validate(result, schema)
}
export async function validateBody(event: RequestEvent, schema: ObjectSchema) {
	let body = null
	try {
		body = await event.request.json()
	} catch (error) {
		throw Error(400, 'Malformed JSON')
	}
	return await validateAsync(body, schema)
}
