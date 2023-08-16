import Joi from 'joi'
import { orderSchema } from './schemas'

export const createSchema = Joi.object({
	name: Joi.string().required(),
	jobRole: Joi.string(),
	company: Joi.string(),
	twitter: Joi.string(),
	instagram: Joi.string(),
	linkedin: Joi.string(),
	facebook: Joi.string(),
	youtube: Joi.string(),
	country: Joi.array(),
	description: Joi.string(),
	pictureId: Joi.number().optional(),
	countryId: Joi.number().optional()
})

export const updateSchema = Joi.object({
	name: Joi.string(),
	jobRole: Joi.string(),
	company: Joi.string(),
	twitter: Joi.string(),
	instagram: Joi.string(),
	linkedin: Joi.string(),
	facebook: Joi.string(),
	youtube: Joi.string(),
	country: Joi.object(),
	description: Joi.string(),
	pictureId: Joi.number().optional(),
	countryId: Joi.number().optional()
})

export const filterSchema = Joi.object({
	offset: Joi.number().min(0).default(0),
	limit: Joi.number().min(0).default(-1),
	search: Joi.string().optional().allow(''),
	order: orderSchema(['name', 'country']).optional()
})
