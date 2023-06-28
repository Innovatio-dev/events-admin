
import { json, type RequestEvent } from "@sveltejs/kit";
import { OrganizerRequestLog } from "$lib/server/models/requestLog";
import Joi from "joi";
import { validateSearchParam } from "$lib/server/middlewares/validator";

const schema = Joi.object({
    offset: Joi.number().min(0).optional().default(0),
    limit: Joi.number().min(-1).optional().default(10)
});

export async function GET(event: RequestEvent) {
    const filter = validateSearchParam(event, schema)

    const count = await OrganizerRequestLog.count()
    const requests = await OrganizerRequestLog.findAll({
        limit: filter.limit >= 0 ? filter.limit : undefined,
        offset: filter.offset
    })

    return json({
        count,
        requests
    })
}
