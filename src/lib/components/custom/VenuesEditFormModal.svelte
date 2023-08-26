<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte'
	// Components
	import Modal from '../Modal.svelte'
	import VenueEventForm from './VenueEventForm.svelte'

	// props
	export let isOpen: boolean
	export let handleClose: () => void
	export let venue: any = null
	export let venues: any[] | null = []
	export let loading: boolean = false

	const dispatch = createEventDispatcher()

	async function updateEventVenue(editedVenue) {
		venues = editedVenue
		handleClose()
		dispatch('save', editedVenue)
	}
</script>

<Modal {isOpen} {handleClose}>
	<div class="flex flex-col items-center gap-5 py-5 px-12">
		<span class="pb-5">
			{'Create the venue profile inside the event creation'}
		</span>
		<VenueEventForm addVenue={venue} onClose={handleClose} editAction={updateEventVenue} />
	</div>
</Modal>
