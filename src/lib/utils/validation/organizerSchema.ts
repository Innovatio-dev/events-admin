import Joi from 'joi'
import { encodedIntegerArray, orderSchema } from '$lib/utils/validation/schemas'
export const createSchema = Joi.object({
	status: Joi.number().default(0),
	name: Joi.string().min(1),
	company: Joi.string().optional(),
	city: Joi.string(),
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required(),
	phone: Joi.string(),
	website: Joi.string().uri().optional(),
	twitter: Joi.string().uri(),
	instagram: Joi.string(),
	linkedin: Joi.string(),
	facebook: Joi.string(),
	youtube: Joi.string(),
	description: Joi.string().optional(),
	mavieId: Joi.string().optional(),
	regions: Joi.array().items(Joi.number()),
	countryId: Joi.number(),
	logoId: Joi.number(),
	dateOfRequest: Joi.date().optional()
})

export const filterSchema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	limit: Joi.number().min(-1).optional().default(10),
	status: encodedIntegerArray.optional(),
	regionId: encodedIntegerArray.optional(),
	typeEvent: encodedIntegerArray.optional(),
	order: orderSchema([
		'id',
		'uid',
		'email',
		'createdAt',
		'name',
		'country',
		'typeEvent',
		'status'
	]).optional(),
	search: Joi.string().optional().allow('')
})

export const updateSchema = Joi.object({
	status: Joi.number(),
	name: Joi.string(),
	company: Joi.string().optional(),
	city: Joi.string(),
	email: Joi.string().email({ tlds: { allow: false } }),
	phone: Joi.string(),
	website: Joi.string().uri().optional(),
	twitter: Joi.string().uri(),
	instagram: Joi.string(),
	linkedin: Joi.string(),
	facebook: Joi.string(),
	youtube: Joi.string(),
	description: Joi.string().optional(),
	mavieId: Joi.string().optional(),
	regions: Joi.array().items(Joi.number()),
	countryId: Joi.number(),
	logoId: Joi.number(),
	reason: Joi.string().required()
})

export const deleteSchema = Joi.object({
	reason: Joi.string().required()
})
