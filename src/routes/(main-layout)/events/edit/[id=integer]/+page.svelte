<script lang="ts">
	//Svelte
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import EventForm, { type EventData } from '$lib/components/custom/EventForm.svelte'

	onMount(async () => {
		const id = $page.params.id
		await fetchEvents(id)
	})

	let loading: boolean = true
	let events: any = null
	let mainSpeakers: any[] = []
	let secondarySpeakers: any[] = []
	let eventId = $page.params.id

	async function fetchEvents(id: string) {
		loading = true
		const response = await fetch(`/api/events/${id}`)
		if (response.ok) {
			events = await response.json()
			updateEventData(events)
		}
		loading = false
	}

	function updateEventData(events: any) {
		const {
			organizer,
			typeEvent,
			isFeatured,
			title,
			description,
			pictures,
			schedule,
			eventSpeakers,
			linkZoom,
			language,
			translation,
			venue,
			secondaryOrganizer,
			secondaryOrganizerDescription
		} = events
		eventData.organizerId = organizer
		eventData.typeEvent = typeEvent
		eventData.isFeatured = isFeatured
		eventData.title = title
		eventData.description = description
		eventData.pictures = pictures ? pictures : []
		eventData.schedule.startTime = new Date(schedule.startTime)
		eventData.schedule.endTime = new Date(schedule.endTime)
		eventData.schedule.visibleAt = new Date(schedule.visibleAt)
		eventData.speakers = eventSpeakers ? eventSpeakers : []
		eventData.linkZoom = linkZoom
		eventData.language = language ? language : null
		eventData.translation = translation ? translation : []
		eventData.venue = venue
		eventData.secondaryOrganizer = secondaryOrganizer
		eventData.secondaryOrganizerDescription = secondaryOrganizerDescription
		mainSpeakers = eventData.speakers.filter((speaker) => speaker.primary)
		secondarySpeakers = eventData.speakers.filter((speaker) => !speaker.primary)
		pictures
	}

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
	<EventForm {eventData} {mainSpeakers} {secondarySpeakers} eventSaved {eventId} />
</section>
