import Joi from 'joi'
import { emailSchema, orderSchema } from './schemas'

export const filterSchema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	limit: Joi.number().min(-1).optional().default(10),
	typeEvent: Joi.number().optional(),
	regionId: Joi.number(),
	countryId: Joi.number(),
	city: Joi.string(),
	dateMin: Joi.date().optional(),
	dateMax: Joi.date().optional(),
	order: orderSchema([
		'id',
		'uid',
		'title',
		'createdAt',
		'country',
		'typeEvent',
		'status',
		'venue',
		'isFeatured'
	]).optional(),
	organizerId: Joi.number(),
	search: Joi.string().optional().allow(''),
	export: Joi.bool().default(false)
})

export const createSchema = Joi.object({
	speakers: Joi.array().items(Joi.number()),
	slug: Joi.string()
		.regex(/^[a-zA-Z0-9-]+$/)
		.min(1)
		.max(100)
		.lowercase()
		.trim()
		.required()
		.messages({
			'string.base': 'The slug must be a string',
			'string.empty': 'The slug cannot be empty',
			'string.min': 'The slug must have at least {#limit} characters',
			'string.max': 'The slug cannot have more than {#limit} characters',
			'string.pattern.base': 'The slug can only contain letters, numbers, and hyphens',
			'string.lowercase': 'The slug must be in lowercase',
			'any.required': 'The slug is a required field'
		}),
	isFeatured: Joi.bool().default(false),
	status: Joi.number(),
	title: Joi.string().required(),
	bannerId: Joi.number(),
	bannerMobileId: Joi.number(),
	description: Joi.string(),
	twitter: Joi.string(),
	instagram: Joi.string(),
	facebook: Joi.string(),
	linkedin: Joi.string(),
	youtube: Joi.string(),
	notes: Joi.string(),
	linkZoom: Joi.string().allow(null, ""),
	language: Joi.object(),
	translation: Joi.array(),
	pictures: Joi.array().items(Joi.number()),
	organizerId: Joi.number().required(),
	schedule: Joi.object({
		startTime: Joi.date().required(),
		endTime: Joi.date(),
		visibleAt: Joi.date()
	}).required()
})

// export const updateSchema = createSchema.keys({
// 	reason: Joi.string().required(),
// 	email: emailSchema
// })

export const updateSchema = Joi.object({
	speakers: Joi.array().items(Joi.number()),
	slug: Joi.string()
		.regex(/^[a-zA-Z0-9-]+$/)
		.min(1)
		.max(100)
		.lowercase()
		.trim()
		.messages({
			'string.base': 'The slug must be a string',
			'string.empty': 'The slug cannot be empty',
			'string.min': 'The slug must have at least {#limit} characters',
			'string.max': 'The slug cannot have more than {#limit} characters',
			'string.pattern.base': 'The slug can only contain letters, numbers, and hyphens',
			'string.lowercase': 'The slug must be in lowercase',
			'any.required': 'The slug is a required field'
		}),
	isFeatured: Joi.bool().default(false),
	status: Joi.number(),
	title: Joi.string(),
	bannerId: Joi.number(),
	bannerMobileId: Joi.number(),
	description: Joi.string(),
	notes: Joi.string(),
	linkZoom: Joi.string().allow("", null),
	language: Joi.object(),
	translation: Joi.array(),
	pictures: Joi.array().items(Joi.number()),
	organizerId: Joi.number(),
	schedule: Joi.object({
		startTime: Joi.date(),
		endTime: Joi.date(),
		visibleAt: Joi.date()
	})
})
