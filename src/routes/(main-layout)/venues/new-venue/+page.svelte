<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
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
				$pageAlert = { message: 'Success! Speaker added correctly.', status: true }
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
