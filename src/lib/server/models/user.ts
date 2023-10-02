import { DataTypes, Model, Sequelize } from 'sequelize'
export class User extends Model {
	declare id: number
	declare cognitoId: string
	declare name: string
	declare surname: string
	declare email: string
	declare role: number
	static SUPERADMIN = 1
	static ADMIN = 2
}

export const init = (sequelize: Sequelize) => {
	User.init(
		{
			cognitoId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			surname: {
				type: DataTypes.STRING
			},
			email: {
				type: DataTypes.STRING,
				unique: true
			},
			role: {
				type: DataTypes.SMALLINT,
				defaultValue: 0
			}
		},
		{
			sequelize,
			timestamps: true,
			paranoid: true,
			scopes: {
				public: {
					attributes: {
						exclude: ['role', 'cognitoId', 'updatedAt', 'deletedAt']
					}
				},
				list: {
					attributes: {
						exclude: ['cognitoId', 'updatedAt', 'deletedAt']
					}
				}
			}
		}
	)
}
