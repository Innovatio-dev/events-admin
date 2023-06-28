import { DataTypes, Model, Sequelize } from 'sequelize'
import { Resource } from './resource'
import { afterBulkCreateListener, afterBulkDestroyListener } from './listeners/resourceListeners'

export class EventPicture extends Model {
    [x: string]: any
}

export const init = (sequelize: Sequelize) => {
    EventPicture.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER,
        },
        resourceId: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize
    })
    

    EventPicture.afterBulkCreate(async (eventPictures: readonly EventPicture[], options) => {
        await afterBulkCreateListener(eventPictures, options,'resourceId')
    });

    EventPicture.afterBulkDestroy(async (options)=>{
        await afterBulkDestroyListener(options, 'resourceId')
    })

}
