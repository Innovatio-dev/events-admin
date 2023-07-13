import Joi from 'joi'

export const passwordSchema = Joi.string()
	.min(8)
	.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
	.messages({
		'string.empty': 'Password length must be at least 8 characters long',
		'string.min': 'Password length must be at least 8 characters long',
		'string.pattern.base':
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)'
	})
	.options({
		abortEarly: false
	})

//Need to disable top level domain, because at compile time it gets an error
export const emailSchema = Joi.string().email({
	tlds: {
		allow: false
	}
})

export const encodedIntegerArray = Joi.string().custom((value, helpers) => {
	const numbers = value.split(',').map(Number)
	const isValid = numbers.every(Number.isInteger)
	if (isValid) {
		return numbers
	} else {
		return helpers.error('any.invalid')
	}
})

export const orderSchema = (validColumns: string[] | null) =>
	Joi.string().custom((value, helpers) => {
		if (value === null) {
			return null
		}
		const strings = value.split(',')
		const result: { name: string; type: string }[] = []
		if (validColumns !== null) {
			for (const string of strings) {
				let colname = string
				let type = 'ASC'
				if (string.startsWith('-')) {
					colname = string.substring(1)
					type = 'DESC'
				}
				if (!validColumns.includes(colname)) {
					return helpers.error('any.invalid')
				}
				result.push({
					name: colname,
					type
				})
			}
		}

		return result
	})

export const encodedStringArray = Joi.string().custom((value) => {
	const strings = value.split(',')
	return strings
})

export const organizerListSchema = Joi.object({
	page: Joi.number().min(1).default(1),
	status: encodedIntegerArray.default([]),
	typeEvent: encodedIntegerArray.default([]),
	order: encodedStringArray.default([]),
	search: Joi.string().default(null)
})

export const challengeNewPasswordSchema = Joi.object({
	email: emailSchema,
	session: Joi.string().required(),
	challengeName: Joi.string().required(),
	newPassword: passwordSchema.options({
		abortEarly: false
	}),
	newPasswordConfirmation: Joi.string().required().valid(Joi.ref('newPassword')).messages({
		'any.only': 'New Password confirmation does not match Password'
	})
})
export const signinSchema = Joi.object({
	email: emailSchema,
	password: passwordSchema
})

export const createUserSchema = Joi.object({
	name: Joi.string().min(1).required(),
	surname: Joi.string().min(1).required(),
	email: emailSchema,
	role: Joi.number().required(),
	password: passwordSchema
})

export const createSuperAdminSchema = Joi.object({
	name: Joi.string().min(1).required(),
	surname: Joi.string().min(1).required(),
	email: emailSchema,
	password: passwordSchema,
	role: Joi.number().required()
})
