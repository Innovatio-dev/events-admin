import { Model, Sequelize } from 'sequelize'

export class EventVenue extends Model {
    declare venueId: number
    declare eventId: number
}

export const init = (sequelize: Sequelize) => {
    EventVenue.init({
    }, {
        sequelize,
        timestamps: false,
        freezeTableName: true
    })
}
