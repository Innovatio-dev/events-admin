import { json, error, type RequestEvent } from '@sveltejs/kit'
import { Venue } from '$lib/server/models/venue'
import Joi from 'joi'
import { validateSearchParam } from '$lib/server/middlewares/validator'
import { Region } from '$lib/server/models/region'
import { HttpResponses } from '$lib/server/constants/httpResponses'
import { Country } from '$lib/server/models/country'
import sequelize, { type Order } from 'sequelize'
import { orderSchema } from '$lib/utils/validation/schemas'
import { getConnection } from '$lib/server/config/database'
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'

const schema = Joi.object({
	offset: Joi.number().min(0).optional().default(0),
	regionId: Joi.number().min(0).optional(),
	limit: Joi.number().min(-1).optional().default(10),
	search: Joi.string().min(0).optional(),
	order: orderSchema(['name', 'region', 'country']).optional()
})

export async function GET(event: RequestEvent) {
	const where: any = {}
	const order: Order = []
	const filter = validateSearchParam(event, schema)

	if (filter.regionId) {
		where.regionId = filter.regionId
	}
	if (filter.order) {
		for (const col of filter.order) {
			order.push([col.name, col.type])
		}
	}
	if (filter.search) {
		const search = `%${filter.search}%`

		where[sequelize.Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Venue.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Venue.city')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('region.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', `%${search}%`)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('country.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			})
		]
	}

	const count = await Venue.count({
		where,
		include: filter.search
			? [
					{ model: Region, as: 'region' },
					{ model: Country, as: 'country' }
			  ]
			: []
	})
	const results = await Venue.scope('list').findAll({
		where,
		limit: filter.limit >= 0 ? filter.limit : undefined,
		offset: filter.offset,
		order,
		include: [
			{
				model: Region,
				as: 'region'
			},
			{
				model: Country,
				as: 'country'
			}
		]
	})

	if (filter.export) {
		const opts = {}
		const parser = new Parser(opts)

		const S3 = new AWS.S3({
			accessKeyId: AS_ACCESS_KEY_ID,
			secretAccessKey: AS_SECRET_ACCESS_KEY,
			region: AS_REGION
		})

		const venues: Array<string | any> = []
		for (const iterator of results) {
			venues.push({
				name: iterator.name,
				city: iterator.city,
				address: iterator.address,
				country: iterator.country.nicename,
				region: iterator.region.name
			})
		}

		const csv = parser.parse(venues)

		const data = {
			Bucket: s3BucketName,
			Key: 'data/dumpdata_venues.csv',
			Body: csv,
			ContentEncoding: 'base64'
		}

		S3.upload(data, function (err, data) {
			if (err) {
				console.log(err)
				console.log('Error uploading data')
			} else {
				console.log('succesfully uploaded!!!')
			}
		})

		return json({
			count,
			formedUrl: `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/data/dumpdata_venues.csv`,
			results
		})
	}
	return json({
		count,
		results
	})
}

const postSchema = Joi.object({
	name: Joi.string(),
	country: Joi.string(),
	city: Joi.string(),
	address: Joi.string(),
	location: Joi.object(),
	email: Joi.string(),
	description: Joi.string(),
	pictures: Joi.array()
})

export async function POST(event: RequestEvent) {
	const data = await event.request.json()
	const validate = postSchema.validate(data)

	const connection = await getConnection()
	const transaction = await connection.transaction()

	try {
		const result = await Venue.create(validate.value, { transaction })
		await result.setPictures(validate.value.pictures, { transaction })

		await transaction.commit()
		return json(result)
	} catch (err) {
		console.log(err)
		await transaction.rollback()
		throw error(HttpResponses.UNEXPECTED_ERROR, {
			message: 'Something happend, try again later ' + err
		})
	}
}
