import { DataTypes, Model, Sequelize } from 'sequelize'

export class Region extends Model {
    declare id: number
    declare name: string
}

export const init = (sequelize: Sequelize) => {
    Region.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        timestamps: false,
        paranoid: true
    })
}
