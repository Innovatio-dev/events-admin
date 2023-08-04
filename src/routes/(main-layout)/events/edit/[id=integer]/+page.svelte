<script lang="ts">
	//Svelte
	import { pageStatus } from '$lib/stores/pageStatus'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import EventForm, { type EventData } from '$lib/components/custom/EventForm.svelte'

	onMount(async () => {
		let id = $page.params.id
		await fetchEvents(id)
	})

	let loading: boolean = true
	let events: any = null
	let eventData: EventData = {
		slug: '',
		organizerId: '',
		typeEvent: '',
		isFeatured: false,
		title: '',
		description: '',
		bannerId: undefined,
		pictures: [],
		linkZoom: null,
		language: null,
		venue: null,
		translation: [],
		secondaryOrganizer: null,
		secondaryOrganizerDescription: null,
		speakers: [],
		speakersSecondary: [],
		schedule: {
			startTime: null,
			endTime: null,
			visibleAt: null
		}
	}
	async function fetchEvents(id) {
		loading = true
		let response = await fetch(`/api/events/${id}`)
		if (response.ok) {
			events = await response.json()
			$pageStatus.title = events.title
			eventData.typeEvent = events.typeEvent
			eventData.isFeatured = events.isFeatured
			eventData.title = events.title
			eventData.description = events.description
			eventData.linkZoom = events.linkZoom
			eventData.language = events.language
			eventData.translation = events.translation
			eventData.secondaryOrganizer = events.secondaryOrganizer
			eventData.secondaryOrganizerDescription = events.secondaryOrganizerDescription
			eventData.organizerId = events.organizer
		}
		loading = false
	}
</script>

<section>
	<EventForm {eventData} />
</section>
