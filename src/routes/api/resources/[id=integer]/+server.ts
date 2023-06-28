import { HttpResponses } from "$lib/server/constants/httpResponses";
import { checkUser } from "$lib/server/middlewares/permission";
import { Resource } from "$lib/server/models/resource";
import { User } from "$lib/server/models/user";
import { json, error as httpError, type RequestEvent } from "@sveltejs/kit";


export async function DELETE(event: RequestEvent) {
    const user = checkUser(event)
    try {
        const { id } = event.params
        const resource = await Resource.findByPk(id)
        if (!resource){
            return json({
                message: 'The resource with id: ' + id + ' does not exist in our records'
            }, {
                status: HttpResponses.NOT_FOUND
            })
        }
        if (user.role != User.SUPERADMIN && resource.userId != user.id){
            return json({
                message: 'You do not have enough permission to delete this resource'
            }, {
                status: HttpResponses.FORBIDDEN
            })
        }
        await resource.destroy()
        return json({
            message: 'Resource was deleted'
        })
        //TODO: invoke deleteobject to s3 server    
    }
    catch (error) {
        console.log(error)
        return httpError(501, {
            message: 'Can not delete the resource'
        })
    }
}
