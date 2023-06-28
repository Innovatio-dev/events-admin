
import { error, json, type RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent){
    const user = event.locals.user
    if (!user){
        throw error(401, {
            message: 'You must provide a valid authorization token in headers'
        })
    }
    return json(user)
}