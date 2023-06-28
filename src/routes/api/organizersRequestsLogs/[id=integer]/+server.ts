import { Region } from "$lib/server/models/region";
import { OrganizerRequest } from "$lib/server/models/request";
import { error, json, type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
    const { id } = event.params

    try {
        const result = await OrganizerRequest.findByPk(id, {
            include: [
                {
                    model: Region,
                    as: 'regions'
                }
            ]
        })

        return json(result)
    } catch (errr){
        console.log(errr)
        throw error(404, {
            message: 'Organizer Request with id ' + id + ' does not exists',
        })
    }
}
