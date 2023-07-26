<script lang="ts">
	// Store
	import { page } from '$app/stores'
	import { pageAlert } from '$lib/stores/pageStatus'

	// Components
	import Modal from '../Modal.svelte'
	import VenueForm from './VenueForm.svelte'

	// props
	export let isOpen: boolean
	export let handleClose: () => void
	export let venue: any = null
	export let response: any = null
	export let loading: boolean = false

	async function postVenue(venue) {
		loading = true
		try {
			const res = await fetch(`${$page.url.origin}/api/venues`, {
				method: 'POST',
				body: JSON.stringify({ ...venue })
			})

			if (res.ok) {
				const data = await res.json()
				response = data
				$pageAlert = { message: 'Success! Venue added correctly.', status: true }
				handleClose()
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
				handleClose()
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
		}
		loading = false
	}

	async function updateVenue(id, venue) {
		loading = true
		try {
			const res = await fetch(`/api/venues/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...venue })
			})
			if (res.ok) {
				const data = await res.json()
				response = data
				$pageAlert = { message: 'Success! Venue updated correctly.', status: true }
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
		loading = false
	}
</script>

<Modal {isOpen} {handleClose}>
	<div class="flex flex-col items-center gap-5 py-5 px-12">
		<span class="pb-5">
			{'Create the venue profile inside the event creation'}
		</span>
		<VenueForm
			addVenue={venue}
			updateAction={venue ? updateVenue : null}
			submitAction={postVenue}
		/>
	</div>
</Modal>
