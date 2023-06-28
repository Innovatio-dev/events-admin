import { EventVenue } from "$lib/server/models/eventVenue";
import { Region } from "$lib/server/models/region";
import { Venue } from "$lib/server/models/venue";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { HttpResponses } from "$lib/server/constants/httpResponses";
import Joi from "joi";
import { Country } from "$lib/server/models/country";

export async function GET(event: RequestEvent) {
    const { id } = event.params

    try {
        const result = await Venue.findByPk(id, {
            include: [
                {
                    model: Region,
                    as: 'region'
                },
                {
                    model: Country,
                    as: 'country'
                }
            ],
            attributes: {
                exclude: ['updatedAt', 'regionId']
            }
        })

        if(!result) {
            return json({
                message: 'Venue not found'
            }, {
                status: HttpResponses.NOT_FOUND
            })
        }

        return json(result, {
            status: HttpResponses.OK_RESPONSE
        })
    } catch (err) {
        throw error(HttpResponses.NOT_FOUND, {
            message: 'Venue with ' + id + ' does not exists',
        })
    }
}

const putSchema = Joi.object({
    name: Joi.string().optional(),
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    address: Joi.string().optional(),
    //TODO: make location validation more deep
    location: Joi.object().optional(),
    email: Joi.string().optional(),
    description: Joi.string().optional()
});

export async function PUT(event: RequestEvent) {
    const { id } = event.params
    const data = await event.request.json();
    const validate = putSchema.validate(data)

    try {
        await Venue.update(validate.value, {
            where: {
                id
            }
        })
    } catch (err) {
        console.log(err);
        throw error(HttpResponses.NOT_FOUND, {
            message: 'Venue with ' + id + ' does not exists',
        })
    }

    return json(validate.value, {
        status: HttpResponses.OK_RESPONSE
    })
}

export async function DELETE(event: RequestEvent) {
    const { id } = event.params
    
    try {

        const result = await Venue.findByPk(id)
        if(!result) {
            // For security reasons don't denote that certain id
            // is not present on the database, perfom a false delete
            // by just returning the "delete result"
            return json({}, {
                status: HttpResponses.NO_RESPONSE
            })
        }

        await EventVenue.destroy({
            where: {
                venueId: id
            }
        })

        Venue.destroy({
            where: {
                id
            }
        })

        return json({}, {
            status: HttpResponses.NO_RESPONSE
        })
    } catch {
        throw error(HttpResponses.UNEXPECTED_ERROR, {
            message: 'Something happend, try again later',
        })
    }
}
