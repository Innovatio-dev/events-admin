import { DataTypes, Model, Sequelize } from 'sequelize'

export class Schedule extends Model {
    declare id: number
    declare daysOfWeek: string
    declare dayOfMonth: string
    declare dayOfYear: string
    declare repeatTimes: number
    declare startTime: Date
    declare endTime: Date
    declare visibleAt: Date
}

export const init = (sequelize: Sequelize) => {
    Schedule.init({
        daysOfWeek: {
            type: DataTypes.STRING
        },
        dayOfMonth: {
            type: DataTypes.TEXT
        },
        dayOfYear: {
            type: DataTypes.TEXT
        },
        startTime: {
            type: DataTypes.DATE
        },
        endTime: {
            type: DataTypes.DATE
        },
        visibleAt: {
            type: DataTypes.DATE
        },
        timeZone: {
            type: DataTypes.STRING
        },
    }, {
        sequelize,
        timestamps: false
    })
}
