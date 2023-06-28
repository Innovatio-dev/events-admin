import { DataTypes, Model, Sequelize } from 'sequelize'

export class Log extends Model {
    declare id: number
    declare name: string
}

export const init = (sequelize: Sequelize) => {
    Log.init({
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        timestamps: true
    })
}
