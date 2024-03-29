import { Country } from '$lib/server/models/country'
import { json } from '@sveltejs/kit'
export async function GET() {
    const countries = await Country.findAll({
        attributes: ['nicename', 'id', 'iso', 'iso3']
    })
    return json(countries)
}