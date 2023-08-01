<script lang="ts">
	import { page } from '$app/stores'
	import Icon from 'svelte-icons-pack'
	import MainButton from '../MainButton.svelte'
	import AiOutlineCloudDownload from 'svelte-icons-pack/ai/AiOutlineCloudDownload'
	import { goto } from '$app/navigation'

	export let urlPrefix: string

	async function getCSVUrl() {
		const res = await fetch(
			`${$page.url.origin}/api/${urlPrefix}${$page.url.search}${
				$page.url.search === '' ? '?' : '&'
			}export=true`
		)

		if (res.ok) {
			const { formedUrl } = await res.json()
			goto(formedUrl)
		}
	}
</script>

<MainButton on:click={getCSVUrl}>
	<Icon className="h-6 w-6" src={AiOutlineCloudDownload} />
	{'Export CSV'}
</MainButton>
