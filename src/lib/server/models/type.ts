import { DataTypes, Model, Sequelize } from 'sequelize'

export class Type extends Model {
    declare id: number
    declare name: string
}

export const init = (sequelize: Sequelize) => {
    Type.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        timestamps: false
    })
}
