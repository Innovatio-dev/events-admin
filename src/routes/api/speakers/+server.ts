import { checkUser } from '$lib/server/middlewares/permission'
import { validateBody, validateSearchParam } from '$lib/server/middlewares/validator'
import { Country } from '$lib/server/models/country'
import { Resource } from '$lib/server/models/resource'
import { Speaker } from '$lib/server/models/speaker'
import { User } from '$lib/server/models/user'
import { foreignKeyOf } from '$lib/server/validation/schemas'
import { createSchema, filterSchema } from '$lib/utils/validation/speakerSchema'
import { json, type RequestEvent } from '@sveltejs/kit'
import sequelize, { Op, type Order } from 'sequelize'
import { Parser } from '@json2csv/plainjs'
import { s3BucketName, s3Region } from '$lib/server/config/aws'
import AWS from 'aws-sdk'
import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'

export async function GET(event: RequestEvent) {
	const filter = validateSearchParam(event, filterSchema)
	const where: any = {}
	const order: Order = []
	if (filter.search) {
		const search = `%${filter.search}%`

		where[Op.or] = [
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Speaker.name')), {
				[sequelize.Op.iLike]: sequelize.fn('unaccent', search)
			}),
			sequelize.where(sequelize.fn('unaccent', sequelize.col('Speaker.company')), {
				[sequelize.Op.iLike]: search
			})
		]
	}
	if (filter.order) {
		for (const col of filter.order) {
			const name = col.name
			if (col.name == 'country') {
				order.push([{ model: Country, as: 'country' }, 'name', col.type])
			} else {
				order.push([name, col.type])
			}
		}
	}
	const count = await Speaker.count({ where })
	const results = await Speaker.scope('mini').findAll({
		limit: filter.limit > 0 ? filter.limit : undefined,
		offset: filter.offset,
		where,
		order
	})

	if (filter.export) {
		const opts = {}
		const parser = new Parser(opts)

		const S3 = new AWS.S3({
			accessKeyId: AS_ACCESS_KEY_ID,
			secretAccessKey: AS_SECRET_ACCESS_KEY,
			region: AS_REGION
		})

		let speakers: Array<string | any> = []
		for (const iterator of results) {
			speakers.push({
				name: iterator.name,
				jobRole: iterator.jobRole,
				company: iterator.company,
				country: iterator.country.nicename
			})
		}

		const csv = parser.parse(speakers)

		var data = {
			Bucket: s3BucketName,
			Key: 'data/dumpdata_speakers.csv',
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
			formedUrl: `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/data/dumpdata_speakers.csv`,
			results
		})
	}

	return json({ count, results })
}
export async function POST(event: RequestEvent) {
	checkUser(event, User.ADMIN)
	const data = await validateBody(
		event,
		createSchema.keys({
			pictureId: foreignKeyOf(Resource),
			countryId: foreignKeyOf(Country)
		})
	)
	const result = await Speaker.create(data)
	const speaker = await Speaker.scope('full').findByPk(result.id)
	return json(speaker)
}
