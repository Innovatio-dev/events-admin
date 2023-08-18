import { DataTypes, Model, Sequelize } from 'sequelize'

export class EventSpeaker extends Model {
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	EventSpeaker.init(
		{
			copy: {
				type: DataTypes.VIRTUAL,
				get() {
					return true
				},
				set(value) {
					throw Error('this field is readonly')
				}
			},
			primary: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			order: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			status: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			},
			name: {
				type: DataTypes.STRING
			},
			jobRole: {
				type: DataTypes.STRING
			},

			company: {
				type: DataTypes.STRING
			},
			instagram: {
				type: DataTypes.STRING
			},
			linkedin: {
				type: DataTypes.STRING
			},
			twitter: {
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
			timestamps: true
		}
	)
}
