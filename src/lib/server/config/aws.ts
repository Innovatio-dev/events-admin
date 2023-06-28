import { AS_ACCESS_KEY_ID, AS_SECRET_ACCESS_KEY, AS_REGION } from '$env/static/private'

import { S3Client } from '@aws-sdk/client-s3'
export const s3BucketName = 'dashboard-events'
export const s3Region = AS_REGION
export const awsCredentials = {
	accessKeyId: AS_ACCESS_KEY_ID,
	secretAccessKey: AS_SECRET_ACCESS_KEY
}
export const s3Client = new S3Client({
	region: s3Region,
	credentials: awsCredentials
})
