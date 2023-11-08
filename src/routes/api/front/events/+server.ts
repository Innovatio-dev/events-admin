import { eventStatuses } from '$lib/server/constants/statuses'
import { validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Event } from '$lib/server/models/event'
import { EventVenue } from '$lib/server/models/eventVenue'
import { Region } from '$lib/server/models/region'
import { Schedule } from '$lib/server/models/schedule'
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
	let order: Order = [
		//['schedule', 'startTime', 'ASC']	
	] 
	let flag = false 

	if (filter.order) {
		for (const col of filter.order) {
			if (col.name == 'startTime') {
				flag = true
				break
			} 
		}
	}
	if(flag) {
		order = []
	}
	
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
		where['$schedule.startTime$'] = { [Op.gte]: filter.dateMin }
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
		// whereCountry.id = filter.countryId
		where['$venue.country.id$'] = filter.countryId
	}
	
	// Count events based on filter conditions and associations
	const count = await Event.count({
		where,
		include: [
			{
				model: EventVenue,
				as: 'venue',
				include: [
					{
						model: Region,
						as: 'region'
					},
					{
						model: Country,
						as: 'country',
						where: whereCountry
					}
				]
			},
			{
				model: Schedule,
				as: 'schedule'
			}
		]
	})
	console.log('order ', order)
	console.log('where ', where)
	console.log('whereSchedule ', whereSchedule)
	// Fetch events based on filter conditions and associations
	const results = await Event.scope('list').findAll({
		where,
		limit: filter.limit >= 0 ? filter.limit : 50,
		offset: filter.offset,
		order,
		include: [
			{
				model: EventVenue,
				as: 'venue',
				// where: whereVenue, // Apply venue filter conditions
				include: [
					{
						model: Region,
						as: 'region',
					},
					{
						model: Country,
						as: 'country',
						where: whereCountry // Apply country filter conditions
					}
				]
			},
			{
				model: Schedule,
				as: 'schedule',
				// where: whereSchedule
				// required: filter.dateMax != null || filter.dateMin != null
			}
		]
	})

	return json({
		count,
		results
	})
}
