import { DataTypes, Model, Sequelize } from 'sequelize'

export class EventVenue extends Model {
    [x: string]: any
}

export const init = (sequelize: Sequelize) => {
    EventVenue.init({
        copy: {
            type: DataTypes.VIRTUAL,
            get() {
                return true
            },
            set(value) {
                throw Error('this field is readonly')
            }
        },
        status: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.JSON
        },
        email: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
        timestamps: false,
        freezeTableName: true
    })
}
