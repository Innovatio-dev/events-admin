<script lang="ts">
	//Svelte
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import EventEditForm, { type EventData } from '$lib/components/custom/EventEditForm.svelte'
	// Store
	import { pageStatus } from '$lib/stores/pageStatus'
	import { Circle3 } from 'svelte-loading-spinners'

	onMount(async () => {
		$pageStatus.title = 'Edit Event'
		const id = $page.params.id
		await fetchEvents(id)
	})

	let loading: boolean = true
	let events: any = null
	let eventId = $page.params.id
	let bannerImage: string
	let mainSpeakers: any[] = []
	let secondarySpeakers: any[] = []

	async function fetchEvents(id: string) {
		loading = true
		const response = await fetch(`/api/events/${id}`)
		if (response.ok) {
			events = await response.json()
			if (events.banner) {
				bannerImage = events.banner.url
			}
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
		eventData.organizerId = organizer.id.toString()
		eventData.organizer = organizer
		eventData.typeEvent = typeEvent
		eventData.isFeatured = isFeatured
		eventData.title = title
		eventData.description = description
		eventData.pictures = pictures ? pictures : []
		eventData.schedule.startTime = new Date(schedule.startTime)
		eventData.schedule.endTime = new Date(schedule.endTime)
		eventData.schedule.visibleAt = new Date(schedule.visibleAt)
		eventData.linkZoom = linkZoom
		eventData.venue = venue
		eventData.language = language ? language : null
		eventData.translation = translation ? translation : []
		eventData.secondaryOrganizer = secondaryOrganizer
		eventData.secondaryOrganizerDescription = secondaryOrganizerDescription
		eventData.speakers = eventSpeakers.filter((speaker) => speaker.primary)
		eventData.speakersSecondary = eventSpeakers.filter((speaker) => !speaker.primary)
		mainSpeakers = eventData.speakers
		secondarySpeakers = eventData.speakersSecondary
	}

	let eventData: EventData = {
		slug: '',
		organizer: [],
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
		secondaryOrganizer: '',
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
	{#if loading}
		<div class="w-full h-[60vh] flex items-center justify-center">
			<Circle3
				ballBottomLeft={'#14dcff'}
				ballBottomRight={'#fd369d'}
				ballTopRight={'#8863e08f'}
				ballTopLeft={'#ffa5d3'}
			/>
		</div>
	{:else}
		<EventEditForm
			{eventData}
			{mainSpeakers}
			{secondarySpeakers}
			{eventId}
			banner={bannerImage}
		/>
	{/if}
</section>
