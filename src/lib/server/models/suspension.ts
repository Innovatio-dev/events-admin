import { DataTypes, Model, Sequelize } from 'sequelize'

export class Suspension extends Model {
    declare id: number
    declare name: string
    declare url: string
}

export const init = (sequelize: Sequelize) => {
    Suspension.init({
        organizerId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eventId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        timestamps: false
    })
}
