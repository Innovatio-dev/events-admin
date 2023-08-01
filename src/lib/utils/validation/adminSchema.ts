import Joi from 'joi'
import { orderSchema } from './schemas'

export const filterSchema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	limit: Joi.number().min(-1).optional().default(10),
	typeEvent: Joi.number().optional(),
	regionId: Joi.number(),
	countryId: Joi.number(),
	city: Joi.string(),
	order: orderSchema(['id', 'uid', 'name', 'surname', 'createdAt', 'status', 'email']).optional(),
	search: Joi.string().optional().allow(''),
	export: Joi.bool().default(false)
})
