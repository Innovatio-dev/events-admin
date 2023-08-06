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
</script>

<section>
	<EventForm {eventData} />
</section>
