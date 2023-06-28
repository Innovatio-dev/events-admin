import { DataTypes, Model, Sequelize } from 'sequelize'

export class EventLog extends Model {
    declare id: number
    declare status: number
    declare reason: string
}

export const init = (sequelize: Sequelize) => {
    EventLog.init({
        status: {
            type: DataTypes.SMALLINT,
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
