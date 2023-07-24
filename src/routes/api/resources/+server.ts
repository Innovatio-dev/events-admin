import { json, type RequestEvent, error as httpError } from '@sveltejs/kit'
import { v4 as uuidv4 } from 'uuid'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3BucketName, s3Client, s3Region } from '$lib/server/config/aws'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Resource } from '$lib/server/models/resource'
import Joi from 'joi'
import { validateBody } from '$lib/server/middlewares/validator'

const schema = Joi.object({
	name: Joi.string().required()
})

export async function POST(event: RequestEvent) {
	const user = event.locals.user
	const params = await validateBody(event, schema)
	try {
		const parts = params.name.split('.')
		const extension = parts.length > 1 ? '.' + parts.pop() : ''
		const newFilename = uuidv4() + extension
		const command = new PutObjectCommand({
			Bucket: s3BucketName,
			Key: `public/${newFilename}`
		})
		const response = await getSignedUrl(s3Client, command, {
			expiresIn: 3600
		})
		const resource = await Resource.create({
			originalName: params.name,
			name: newFilename,
			userId: user?.id,
			url: `https://${s3BucketName}.s3.${s3Region}.amazonaws.com/public/${newFilename}`
		})
		return json({ uploadUrl: response, resource })
	} catch (error) {
		console.log(error)
		return httpError(501, {
			message: 'Can not upload the file'
		})
	}
}
