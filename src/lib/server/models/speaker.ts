import { DataTypes, Model, Sequelize } from 'sequelize'
import { Resource } from './resource'
import { beforeSingleSaveListener } from './listeners/resourceListeners'
import { Country } from './country'

export class Speaker extends Model {
	public static INACTIVE = 0
	public static ACTIVE = 1;
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	Speaker.init(
		{
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			jobRole: {
				type: DataTypes.STRING
			},
			company: {
				type: DataTypes.STRING
			},
			twitter: {
				type: DataTypes.STRING
			},
			instagram: {
				type: DataTypes.STRING
			},
			linkedin: {
				type: DataTypes.STRING
			},
			facebook: {
				type: DataTypes.STRING
			},
			youtube: {
				type: DataTypes.STRING
			},
			description: {
				type: DataTypes.TEXT
			}
		},
		{
			sequelize,
			timestamps: true,
			paranoid: true
		}
	)
	Speaker.addScope('mini', () => ({
		attributes: ['id', 'status', 'name', 'jobRole', 'company'],
		include: [
			{
				model: Resource.scope('mini'),
				as: 'picture'
			},
			{
				model: Country.scope('mini'),
				as: 'country'
			}
		]
	}))
	Speaker.addScope('full', () => ({
		attributes: {
			exclude: ['deletedAt', 'updatedAt', 'countryId', 'pictureId']
		},
		include: [
			{
				model: Resource.scope('mini'),
				as: 'picture'
			},
			{
				model: Country.scope('mini'),
				as: 'country'
			}
		]
	}))
	Speaker.beforeSave(async (instance, options) => {
		beforeSingleSaveListener(instance, options, 'pictureId')
	})
}
