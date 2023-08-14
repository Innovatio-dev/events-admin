import { eventStatuses } from '$lib/server/constants/statuses'
import { validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Event } from '$lib/server/models/event'
import { Region } from '$lib/server/models/region'
import { Schedule } from '$lib/server/models/schedule'
import { Venue } from '$lib/server/models/venue'
import { filterSchema } from '$lib/utils/validation/eventSchema'
import { json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op, type Order } from 'sequelize'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	let where: any = {}
	
	if (filter.regionId) {
		where = {
			'$venue.region.id$': { [Op.in]: filter.regionId }
		}
	}
	const whereCountry: any = {} // Object for country model's filter conditions
	const whereSchedule: any = {}
	const order: Order = [
		['schedule', 'startTime', 'ASC']	
	] 

	
	if (filter.countryId) {
		whereCountry.id = filter.countryId
	}
	if (filter.organizerId) {
		where.organizerId = filter.organizerId
	}
	if (filter.dateMin && filter.dateMax) {
		whereSchedule.date = {
			[Op.between]: [filter.dateMin, filter.dateMax]
		}
	} else if (filter.dateMin) {
		whereSchedule.startTime = {
			[Op.gte]: filter.dateMin
		}
	} else if (filter.dateMax) {
		whereSchedule.startTime = {
			[Op.lte]: filter.dateMax
		}
	}

	if (filter.typeEvent != null) {
		where.typeEvent = { [Op.in]: filter.typeEvent }
	}

	where.status = eventStatuses.PUBLISHED
	
	if (filter.order) {
		for (const col of filter.order) {
			let name = col.name
			if (col.name == 'uid') {
				name = 'id'
				order.push([name, col.type])
			} else if (col.name == 'country') {
				order.push(['venue', 'country', 'name', col.type])
			}
			else if (col.name == 'startTime') {
				order.push(['schedule', 'startTime', col.type])
			} 
			else {
				order.push([name, col.type])
			}
		}
	}

	if (filter.search) {
		const search = `%${filter.search}%`

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Event.title')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.cast(sequelize.col('Event.id'), 'text'), {
				[sequelize.Op.iLike]: search
			})
		]
	}
	if (filter.countryId) {
		whereCountry.id = filter.countryId
	}
	
	// Count events based on filter conditions and associations
	const count = await Event.count({
		where,
		include: [
			{
				model: Venue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region' // Apply region filter conditions
					},
					{
						model: Country,
						as: 'country',
						where: whereCountry // Apply country filter conditions
					}
				]
			}
		]
	})

	// Fetch events based on filter conditions and associations
	const results = await Event.scope('list').findAll({
		where,
		limit: filter.limit >= 0 ? filter.limit : 50,
		offset: filter.offset,
		order,
		include: [
			{
				model: Venue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region',
					},
					{
						model: Country.scope('full'),
						as: 'country',
						where: whereCountry // Apply country filter conditions
					}
				]
			},
			{
				model: Schedule,
				as: 'schedule',
				where: whereSchedule
				// required: filter.dateMax != null || filter.dateMin != null
			}
		]
	})

	return json({
		count,
		results
	})
}
