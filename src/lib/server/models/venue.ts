import { DataTypes, Model, Sequelize } from 'sequelize'
import { Region } from './region'
import { Country } from './country'

export class Venue extends Model {
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	Venue.init(
		{
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			city: {
				type: DataTypes.STRING
			},
			address: {
				type: DataTypes.STRING
			},
			location: {
				type: DataTypes.JSON
			},
			email: {
				type: DataTypes.STRING
			},
			description: {
				type: DataTypes.STRING
			}
		},
		{
			sequelize,
			timestamps: true,
			paranoid: true
		}
	)
	Venue.addScope('mini', () => ({
		attributes: ['id', 'status', 'name', 'city', 'description', 'location'],
		include: [
			{
				model: Region,
				as: 'region'
			},
			{
				model: Country.scope('mini'),
				as: 'country'
			}
		]
	}))
	Venue.addScope('list', () => ({
		attributes: ['id', 'status', 'name', 'city', 'address', 'description', 'location'],
		include: [
			{
				model: Region,
				as: 'region'
			},
			{
				model: Country.scope('mini'),
				as: 'country'
			}
		]
	}))
}
