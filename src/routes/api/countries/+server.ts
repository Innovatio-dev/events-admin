import { Country } from '$lib/server/models/country'
import { json } from '@sveltejs/kit'
export async function GET() {
    const countries = await Country.findAll({
        order: ['name']
    })
    return json(countries)
}