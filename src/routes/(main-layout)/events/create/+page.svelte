<script lang="ts">
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import EventForm, { type EventData } from '$lib/components/custom/EventForm.svelte'

	onMount(() => {
		$pageStatus.title = 'Create an Event'
	})

	let eventData: EventData = {
		slug: '',
		organizerId: '',
		typeEvent: null,
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
		secondaryOrganizerDescription: '',
		speakers: [],
		speakersSecondary: [],
		schedule: {
			startTime: null,
			endTime: null,
			visibleAt: null
		}
	}
</script>

<section>
	<EventForm {eventData} />
</section>
