import type { Handle } from '@sveltejs/kit'
import { getConnection } from '../config/database'

export const dbInitializerHook = async function ({ event, resolve }) {
	const connection = await getConnection()
	await connection.authenticate()
	return resolve(event)
} satisfies Handle
