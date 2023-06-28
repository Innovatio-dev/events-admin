import { DataTypes, Model, Sequelize } from 'sequelize'
import { afterBulkCreateListener } from './listeners/resourceListeners'

export class VenuePicture extends Model {
    [x:string]:any
}

export const init = (sequelize: Sequelize) => {
    VenuePicture.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        venueId: {
            type: DataTypes.INTEGER,
        },
        resourceId: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize
    })
    VenuePicture.afterBulkCreate(async (instances, options)=>{
        await afterBulkCreateListener(instances, options, 'resourceId')
    })
}
