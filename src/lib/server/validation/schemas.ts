import Joi from 'joi'
import type Model from 'sequelize'
function constructPathLabel(path: any[]): string {
	let label = ''

	for (let i = 0; i < path.length; i++) {
		if (i > 0) {
			if (typeof path[i] !== 'number') {
				label = `${label}.${path[i]}`
			} else {
				label = `${label}[${path[i]}]`
			}
		} else {
			label += path[i]
		}
	}

	return label
}
export const foreignKeyOf = (model: any, column = 'id') => {
	return Joi.any().external(async (value, helpers) => {
		if (!value) {
			return value
		}
		try {
			const result = await model.findOne({ where: { [column]: value } })
			if (!result) {
				throw new Error('No record found')
			}
		} catch (error) {
			const key = helpers.state.path[helpers.state.path.length - 1]
			const label = constructPathLabel(helpers.state.path)
			throw new Joi.ValidationError('Must be a valid foreign key', [
				{
					type: 'any.invalid',
					message: `"${label}" must be a valid identifier of ${model.getTableName()}`,
					path: helpers.state.path,
					context: {
						label,
						value: helpers.original,
						key
					}
				}
			])
		}

		return value
	})
}
export const uniqueKeyOf = (model: Mode, column = 'email') => {
	return Joi.any().external(async (value, helpers) => {
		const whereOptions: any = {
			[column]: value
		}

		// if (model.primaryKeyAttributes && model.primaryKeyAttributes.length > 0) {
		// 	// Exclude self when validating an existing record
		// 	whereOptions[model.primaryKeyAttributes[0]] = {
		// 		[model.sequelize.Op.ne]:
		// 			helpers.state.ancestors[0].value[model.primaryKeyAttributes[0]]
		// 	}
		// }

		// Perform the uniqueness check using the model and where options
		if (!value) {
			return value
		}
		try {
			const result = await model.findOne({ where: whereOptions })
			if (result) {
				throw new Error(`"${helpers.state.path[0]}" must be unique`)
			}
		} catch (error) {
			const key = helpers.state.path[helpers.state.path.length - 1]
			const label = constructPathLabel(helpers.state.path)
			throw new Joi.ValidationError('Must be a valid foreign key', [
				{
					type: 'any.invalid',
					message: `"${label}" must be unique`,
					path: helpers.state.path,
					context: {
						label,
						value: helpers.original,
						key
					}
				}
			])
		}

		return value
	})
}
