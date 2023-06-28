import { DataTypes, Model, Sequelize } from 'sequelize'

export class OrganizerLog extends Model {
    declare status: number
    declare reason: string
}

export const init = (sequelize: Sequelize) => {
    OrganizerLog.init({
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
