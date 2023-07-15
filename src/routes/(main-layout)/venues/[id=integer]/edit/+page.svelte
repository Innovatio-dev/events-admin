<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { goto } from '$app/navigation'
	// Components
	import VenueForm from '$lib/components/custom/VenueForm.svelte'
	// Animations
	import { Circle3 } from 'svelte-loading-spinners'

	let venue: any = null
	let loading: boolean = true

	async function fetchVenue(id) {
		loading = true
		try {
			const res = await fetch(`/api/venues/${id}`)
			if (res.ok) {
				venue = await res.json()
				// console.log(venue)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Venue Details'
		await fetchVenue(id)
	})
</script>

<section class="w-full flex justify-center">
	{#if loading}
		<div class="w-full h-[50vh] flex items-center justify-center">
			<Circle3 />
		</div>
	{:else if venue}
		<div class="py-12">
			<VenueForm addVenue={venue} />
		</div>
	{/if}
</section>
