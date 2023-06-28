import { Region } from '$lib/server/models/region'
import { json, type RequestEvent} from '@sveltejs/kit'
export async function GET(event: RequestEvent) {
    const regions = await Region.findAll()
    return json(regions)
}