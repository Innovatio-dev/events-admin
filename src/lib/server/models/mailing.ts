import { DataTypes, Model, Sequelize } from 'sequelize'

export class Mailing extends Model {
	declare id: number
	declare name: string
}

export const init = (sequelize: Sequelize) => {
	Mailing.init(
		{
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING
			},
			surname: {
				type: DataTypes.STRING
			},
			country: {
				type: DataTypes.STRING
			},
			mavieId: {
				type: DataTypes.TEXT
			}
		},
		{
			sequelize,
			timestamps: true
		}
	)
}
