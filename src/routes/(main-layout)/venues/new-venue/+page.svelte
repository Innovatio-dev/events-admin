<script lang='ts'>
	// Svelte
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	// Components
	import VenueForm from '$lib/components/custom/VenueForm.svelte'

	const createNewVenue = async (venue) => {
		await postVenue(venue)
	}

	async function postVenue(venue) {
		try {
			const res = await fetch(`${$page.url.origin}/api/venues`, {
				method: 'POST',
				body: JSON.stringify({ ...venue })
			})

			if (res.ok) {
				const data = await res.json()
				console.log(data)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
	}

	onMount(() => {
		$pageStatus.title = 'Create Venue'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<VenueForm submitAction={createNewVenue}/>
	</div>
</section>
