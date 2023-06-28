
import { json, error, type RequestEvent } from "@sveltejs/kit"
import { OrganizerRequestLog } from "$lib/server/models/requestLog"
import { OrganizerRequest } from "$lib/server/models/request"
import Joi from "joi"
import { validateSearchParam } from "$lib/server/middlewares/validator"
import { HttpResponses } from "$lib/server/constants/httpResponses"

const schema = Joi.object({
    offset: Joi.number().min(0).optional().default(0),
    limit: Joi.number().min(-1).optional().default(10)
})

export async function GET(event: RequestEvent) {
    const { id } = event.params
    const filter = validateSearchParam(event, schema)

    const count = await OrganizerRequestLog.count()
    const requests = await OrganizerRequestLog.findAll({
        limit: filter.limit >= 0 ? filter.limit : undefined,
        offset: filter.offset,
        where: {
            organizerRequestId: id
        }
    })

    return json({
        count,
        requests
    })
}

const postSchema = Joi.object({
    status: Joi.string(),
    reason: Joi.string()
})

export async function POST(event: RequestEvent) {

    const { id } = event.params
    //TODO: change the organizer request id from requestId to
    //TODO: organizersRequestsId
    try {
        await OrganizerRequest.findByPk(id)
        
        const data = await event.request.json()
        const validate = postSchema.validate(data)
        validate.value.organizerRequestId = id
        validate.value.userId = 1
    
        const result = await OrganizerRequestLog.create(
            validate.value 
        )
    
        return json(result)
    } catch (errr){
        console.log(errr)
        throw error(HttpResponses.NOT_FOUND, {
            message: 'Organizer Request with id ' + id + ' does not exists',
        })
    }

}
