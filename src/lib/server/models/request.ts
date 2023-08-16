import { DataTypes, Model, Sequelize, col, fn } from 'sequelize'
import { Country } from './country'
import { Region } from './region'
import { Resource } from './resource'

export class OrganizerRequest extends Model {
	public static STATUS_PENDING = 0
	public static STATUS_APPROVED = 1
	public static STATUS_DENIED = 2;
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	OrganizerRequest.init(
		{
			uid: {
				type: DataTypes.VIRTUAL,
				get() {
					return `R${this.id.toString().padStart(4, '0')}`
				},
				set(value) {
					throw Error('this field is readonly')
				}
			},
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0,
				allowNull: false
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
			email: {
				type: DataTypes.STRING
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
			mavieId: {
				type: DataTypes.STRING
			},
			description: {
				type: DataTypes.TEXT
			}
		},
		{
			sequelize,
			timestamps: true,
			paranoid: true,
			scopes: {
				full: {
					include: [
						{
							model: Region,
							as: 'regions'
						},
						{
							model: Country,
							as: 'country'
						},
						{
							model: Resource,
							as: 'logo'
						}
					]
				},
				list: {
					attributes: [
						'uid',
						'id',
						'status',
						'typeEvent',
						'createdAt',
						'name',
						'company',
						'mavieId',
						'email'
					],
					include: [
						{
							model: Region,
							as: 'regions'
						},
						{
							model: Country.scope('mini'),
							as: 'country'
						}
					]
				},
				single: {
					attributes: [
						'id',
						'status',
						[fn('CONCAT', '#ORQ', col('OrganizerRequest.id')), 'identifier'],
						'name',
						'company',
						'email',
						'phone',
						'website',
						'twitter',
						'instagram',
						'linkedin',
						'facebook',
						'youtube',
						'mavieId',
						'description'
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
							model: Resource,
							as: 'logo'
						}
					]
				}
			}
		}
	)
}
