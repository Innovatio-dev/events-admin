import { DataTypes, Model, Sequelize } from 'sequelize'

export class Country extends Model {
    declare id: number
    declare name: string
    declare iso: string
    declare nicename: string
    declare iso3: string
    declare numcode: number
    declare phonecode: number
    [x: string]: any
}

export const init = (sequelize: Sequelize) => {
    Country.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        iso: {
            type: DataTypes.CHAR(2)
        },
        nicename: {
            type: DataTypes.STRING
        },
        iso3: {
            type: DataTypes.CHAR(3)
        },
        numcode: {
            type: DataTypes.SMALLINT
        },
        phonecode: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        timestamps: false,
    })
    Country.addScope('mini', () => ({
        attributes: ['id', 'nicename', 'iso']
    }))
    Country.addScope('full', () => ({
        attributes: ['name', 'iso', 'nicename', 'iso3']
    }))
}
