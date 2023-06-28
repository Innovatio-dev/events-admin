import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { dbInitializerHook } from '$lib/server/hooks/database'
import { authHook } from '$lib/server/hooks/auth'
import { corsHook } from '$lib/server/hooks/cors'

export const handle: Handle = sequence(dbInitializerHook, corsHook, authHook)
