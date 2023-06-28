import { Sequelize, type Model, type BulkCreateOptions, type DestroyOptions, type SaveOptions } from "sequelize";
import { Resource } from "../resource";

export async function beforeSingleSaveListener(model: Model<any, any>, options: SaveOptions<any>, resourceIdColumn: string) {
    if (model.changed(resourceIdColumn as keyof Model)) {
        const previousResourceId = model.previous(resourceIdColumn); // Obtiene el valor anterior de resourceId
        const newResourceId = model.get(resourceIdColumn) as number // Obtiene el nuevo valor de resourceId

        if (previousResourceId !== null) {
            // Si el valor anterior de resourceId existe
            const previousResource = await Resource.findByPk(previousResourceId); // Busca el recurso anterior por su id
            if (previousResource) {
                // Si se encuentra el recurso anterior
                previousResource.refCount -= 1
                await previousResource.save({
                    transaction: options.transaction
                }); // Guarda los cambios en el recurso anterior en la base de datos
            }
        }

        if (newResourceId !== null) {
            // Si el nuevo valor de resourceId existe
            const newResource = await Resource.findByPk(newResourceId); // Busca el nuevo recurso por su id
            if (newResource) {
                // Si se encuentra el nuevo recurso
                newResource.refCount += 1
                await newResource.save({
                    transaction: options.transaction
                }); // Guarda los cambios en el nuevo recurso en la base de datos
            }
        }
    }
}

export async function afterBulkCreateListener(
    pivotRows: readonly Model<any, any>[], 
    options: BulkCreateOptions<any>,
    resourceIdColumn: string ){
        
    const resourceIds = pivotRows.map(row=>{
        const rowWithResource = row as {[resourceIdColumn:string]: any}
        return rowWithResource[resourceIdColumn]
    });
    await Resource.update({ refCount: Sequelize.literal('"refCount" + 1') }, {
        where: { id: resourceIds },
        transaction: options.transaction
    });
}

export async function afterBulkDestroyListener(options: DestroyOptions, resourceIdColumn: string){
    if (options.where){
        const whereWithResource = options.where as {[key: string]: string}
        const ids = whereWithResource[resourceIdColumn]
        await Resource.update({ refCount: Sequelize.literal('"refCount" - 1') }, {
            where: { id: ids },
            transaction: options.transaction
        });
    }
}