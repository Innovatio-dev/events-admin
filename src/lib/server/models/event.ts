import { DataTypes, Model, Sequelize } from 'sequelize'
import { Region } from './region'
import { Country } from './country'
import { User } from './user'
import { Organizer } from './organizer'
import { Category } from './category'
import { Venue } from './venue'
import { EventSpeaker } from './eventSpeaker'
import { Schedule } from './schedule'
import { Resource } from './resource'
import { beforeSingleSaveListener } from './listeners/resourceListeners'
export class Event extends Model {
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	Event.init(
		{
			uid: {
				type: DataTypes.VIRTUAL,
				get() {
					return `E${this.id.toString().padStart(4, '0')}`
				},
				set(value) {
					throw Error('this field is readonly')
				}
			},
			slug: {
				type: DataTypes.STRING,
				unique: true
			},
			typeEvent: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			isFeatured: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},

			title: {
				type: DataTypes.STRING,
				allowNull: false
			},

			description: {
				type: DataTypes.TEXT
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
			notes: {
				// notes for admins if needed
				type: DataTypes.TEXT
			},
			mailing: {
				// for sendinblu options or another one
				type: DataTypes.STRING
			},
			linkZoom: {
				type: DataTypes.STRING
			},
			language: {
				type: DataTypes.JSON
			},
			translation: {
				type: DataTypes.JSON
			},
			secondaryOrganizer: {
				type: DataTypes.STRING
			},
			secondaryOrganizerDescription: {
				type: DataTypes.STRING
			}
		},
		{
			tableName: 'Events',
			sequelize,
			timestamps: true,
			paranoid: true
			// indexes: [
			//     {
			//         name: 'event_description_trgm_idx',
			//         using: 'GIN',
			//         concurrently: true,
			//         fields: [sequelize.literal("title gin_trgm_ops")]
			//     },
			// ]
		}
	)
	Event.addScope('list', () => ({
		include: [
			{
				model: Venue.scope('mini'),
				as: 'venue',
				include: [
					{
						model: Region,
						as: 'region'
					},
					{
						model: Country,
						as: 'country'
					}
				]
			},
			{
				model: Resource.scope('mini'),
				as: 'banner'
			},
			{
				model: Resource.scope('mini'),
				as: 'bannerMobile'
			},
			{
				model: Schedule,
				as: 'schedule'
			}
		],
		attributes: {
			exclude: [
				'regionId',
				'userId',
				'countryId',
				'venueId',
				'scheduleId',
				'bannerId',
				'bannerMobileId'
			]
		}
	}))

	Event.addScope('full', () => ({
		attributes: {
			exclude: [
				'userId',
				'regionId',
				'countryId',
				'organizerId',
				'createdAt',
				'updatedAt',
				'deletedAt',
				'notes'
			]
		},
		include: [
			{
				model: User.scope('public'),
				as: 'user'
			},
			{
				model: Schedule,
				as: 'schedule'
			},
			{
				model: Resource.scope('mini'),
				as: 'banner'
			},
			{
				model: Resource.scope('mini'),
				as: 'bannerMobile'
			},
			{
				model: Resource.scope('mini'),
				through: {
					attributes: []
				},
				as: 'pictures'
			},
			{
				model: Organizer.scope('full'),
				as: 'organizer'
			},
			{
				model: Category,
				as: 'categories'
			},
			{
				model: Venue.scope('mini'),
				as: 'venue',
				include: [
					{
						model: Resource.scope('mini'),
						as: 'pictures',
						through: {
							attributes: []
						}
					}
				]
			},
			{
				model: EventSpeaker,
				as: 'eventSpeakers',
				include: [
					{
						model: Resource.scope('mini'),
						as: 'picture'
					}
				]
			}
		]
	}))

	Event.addScope('web', () => ({
		attributes: [
			'id',
			'slug',
			'title',
			'description',
			'mailing',
			'linkZoom',
			'language',
			'translation',
			'secondaryOrganizer',
			'secondaryOrganizerDescription'
		],
		include: [
			{
				model: Resource,
				as: 'banner',
				attributes: ['url']
			},
			{
				model: Resource,
				as: 'bannerMobile',
				attributes: ['url']
			},
			{
				model: Schedule,
				as: 'schedule'
			},
			{
				model: Resource,
				as: 'pictures',
				attributes: ['url'],
				through: {
					attributes: []
				}
			},
			{
				model: Organizer,
				as: 'organizer',
				attributes: [
					'id',
					'name',
					'website',
					'twitter',
					'instagram',
					'linkedin',
					'facebook',
					'youtube',
					'description'
				],
				include: [
					{
						model: Resource,
						as: 'logo',
						attributes: ['url']
					},

					{
						model: Country,
						as: 'country',
						attributes: ['iso', 'iso3', 'name']
					}
				]
			},
			{
				model: Venue,
				as: 'venue',
				attributes: ['id', 'name', 'city', 'description', 'location'],
				include: [
					{
						model: Region,
						as: 'region'
					},
					{
						model: Country,
						as: 'country',
						attributes: ['iso', 'iso3', 'name']
					},
					{
						model: Resource,
						as: 'pictures',
						through: {
							attributes: []
						},
						attributes: ['url']
					}
				]
			},
			{
				model: EventSpeaker,
				as: 'eventSpeakers',
				attributes: [
					'id',
					'primary',
					'order',
					'name',
					'jobRole',
					'company',
					'instagram',
					'twitter',
					'linkedin',
					'facebook',
					'youtube',
					'description'
				],
				include: [
					{
						model: Country,
						as: 'country',
						attributes: ['iso', 'iso3', 'name']
					},
					{
						model: Resource,
						as: 'picture',
						attributes: ['url']
					}
				]
			}
		]
	}))

	Event.beforeSave(async (event: Event, options) => {
		await beforeSingleSaveListener(event, options, 'bannerId')
		await beforeSingleSaveListener(event, options, 'bannerMobileId')
	})
}
