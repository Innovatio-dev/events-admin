// See https://kit.svelte.dev/docs/types#app

import type { User } from '$lib/server/models/user'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module 'svelte-icons-pack' {
	const Icon: any
	export default Icon
}

export {}
