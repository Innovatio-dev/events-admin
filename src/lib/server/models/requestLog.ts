import { DataTypes, Model, Sequelize } from 'sequelize'

export class OrganizerRequestLog extends Model {
    declare id: number
    declare status: string
    declare reason: string
}

export const init = (sequelize: Sequelize) => {
    OrganizerRequestLog.init({
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
