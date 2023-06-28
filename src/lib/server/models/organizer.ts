import { DataTypes, Model, Sequelize } from 'sequelize'
import { Region } from './region'
import { Country } from './country'
import { Resource } from './resource'
import { beforeSingleSaveListener } from './listeners/resourceListeners'
export class Organizer extends Model {
	public static STATUS_INACTIVE = 0
	public static STATUS_ACTIVE = 1
	public static STATUS_SUSPENDED = 2
	public static TYPE_EVENT_LIVE = 0
	public static TYPE_EVENT_VIRTUAL = 1;
	[x: string]: any

	get logoUrl(): string | null {
		const banner = this.getDataValue('logo')
		return banner ? banner.name : null
	}
}

export const init = (sequelize: Sequelize) => {
	Organizer.init(
		{
			uid: {
				type: DataTypes.VIRTUAL,
				get() {
					return `U${this.id.toString().padStart(4, '0')}`
				},
				set(value) {
					throw Error('this field is readonly')
				}
			},
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			typeEvent: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			company: {
				type: DataTypes.STRING
			},
			city: {
				type: DataTypes.STRING
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			phone: {
				type: DataTypes.STRING
			},
			website: {
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
				type: DataTypes.STRING
			},
			mavieId: {
				type: DataTypes.STRING
			},
			dateOfRequest: {
				type: DataTypes.DATE,
				allowNull: true,
				defaultValue: null
			}
		},
		{
			sequelize,
			timestamps: true,
			paranoid: true
		}
	)
	Organizer.addScope('list', () => {
		return {
			attributes: [
				'uid',
				'id',
				'status',
				'name',
				'company',
				'city',
				'email',
				'phone',
				'description',
				'createdAt',
				'dateOfRequest',
				'typeEvent',
				'mavieId'
			],
			include: [
				{
					model: Region,
					as: 'regions'
				},
				{
					model: Country.scope('mini'),
					as: 'country'
				},
				{
					model: Resource.scope('mini'),
					as: 'logo'
				}
			]
		}
	})
	Organizer.addScope('mini', () => ({
		attributes: ['id', 'status', 'name', 'company', 'city', 'email', 'mavieId'],
		include: [
			{
				model: Resource.scope('mini'),
				as: 'logo'
			}
		]
	}))
	Organizer.addScope('full', () => ({
		attributes: { exclude: ['countryId', 'deletedAt', 'logoId'] },
		include: [
			{
				model: Region,
				as: 'regions',
				through: {
					attributes: [] //Exclude pivote table
				}
			},
			{
				model: Country.scope('full'),
				as: 'country'
			},
			{
				model: Resource.scope('mini'),
				as: 'logo'
			}
		]
	}))
	Organizer.beforeSave(async (organizer: Organizer, options) =>
		beforeSingleSaveListener(organizer, options, 'logoId')
	)
}
