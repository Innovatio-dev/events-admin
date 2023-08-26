<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import VenueForm from '$lib/components/custom/VenueEditForm.svelte'
	import { goto } from '$app/navigation'

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
				$pageAlert = { message: 'Success! Venue added correctly.', status: true }
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

	onMount(() => {
		$pageStatus.title = 'Create Venue'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<VenueForm submitAction={createNewVenue} />
	</div>
</section>
