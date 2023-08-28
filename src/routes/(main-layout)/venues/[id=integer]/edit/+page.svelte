<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
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

	async function updateVenue(id, venue) {
		try {
			const res = await fetch(`/api/venues/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...venue })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Venue updated correctly.', status: true }
				goto('/venues')
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
		}
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Edit Venue'
		await fetchVenue(id)
	})
</script>

<section class="w-full flex justify-center">
	{#if loading}
		<div class="w-full h-[50vh] flex items-center justify-center">
			<Circle3
				ballBottomLeft={'#14dcff'}
				ballBottomRight={'#fd369d'}
				ballTopRight={'#8863e08f'}
				ballTopLeft={'#ffa5d3'}
			/>
		</div>
	{:else if venue}
		<div class="py-12">
			<VenueForm updateAction={updateVenue} addVenue={venue} />
		</div>
	{/if}
</section>
