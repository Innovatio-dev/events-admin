import { DataTypes, Model, Sequelize } from 'sequelize'

export class Resource extends Model {
	[x: string]: any
}

export const init = (sequelize: Sequelize) => {
	Resource.init(
		{
			originalName: {
				type: DataTypes.STRING
			},
			refCount: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			name: {
				type: DataTypes.STRING
			},
			url: {
				type: DataTypes.STRING(512)
			}
		},
		{
			sequelize,
			timestamps: true
		}
	)
	Resource.addScope('mini', () => ({
		attributes: ['id', 'name', 'url']
	}))
}
