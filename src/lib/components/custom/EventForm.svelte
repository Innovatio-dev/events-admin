<script context="module" lang="ts">
	export interface EventData {
		slug: string
		organizerId: string
		typeEvent: string | null
		isFeatured: boolean
		title: string
		description: string
		bannerId: number | undefined
		pictures: any[]
		linkZoom: any
		language: any
		venue: any
		translation: { name: string; flagIso: string }[]
		secondaryOrganizer: string | null
		secondaryOrganizerDescription: string | null
		speakers: any[]
		speakersSecondary: any[]
		schedule: {
			startTime: Date | null
			endTime: Date | null
			visibleAt: Date | null
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	// Components
	import ActionsViewer from '$lib/components/table_cell/ActionsViewer.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import UploadedImage from './UploadedImage.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
	import MapViewerPopup from '$lib/components/table_cell/MapViewerPopup.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import Badge from '$lib/components/Badge.svelte'
	import ToggleButtton from '$lib/components/ToggleButtton.svelte'
	import SpeakersFormModal from '$lib/components/custom/SpeakersFormModal.svelte'
	import VenuesFormModal from '$lib/components/custom/VenuesFormModal.svelte'
	import DatePicker from '$lib/components/DatePicker.svelte'
	import DragAndDrop from '$lib/components/DragAndDrop.svelte'
	import DropdownFetcher from '$lib/components/DropdownFetcher.svelte'
	import Input from '$lib/components/Input.svelte'
	import LabelInput from '$lib/components/LabelInput.svelte'
	import SectionHeader from '$lib/components/SectionHeader.svelte'
	import TextWithIcon from '$lib/components/table_cell/TextWithIcon.svelte'
	import OrderableTable, { type Column } from '$lib/components/OrderableTable.svelte'
	import TextWithImageViewer from '$lib/components/custom/data_viewer/TextWithImageViewer.svelte'
	// Utils
	import { languages } from '$lib/utils/constants/Languages'
	// Icons
	import CgMathEqual from 'svelte-icons-pack/cg/CgMathEqual'
	import { pageAlert } from '$lib/stores/pageStatus'

	const typeEvents = [
		{
			title: 'Virtual',
			value: 0
		},
		{
			title: 'Live',
			value: 1
		}
	]
	const featured = [
		{
			title: 'Featured',
			value: true
		},
		{
			title: 'Regular',
			value: false
		}
	]

	let loading = false

	interface Speaker {
		id: number
	}

	// Props
	export let eventData: EventData
	const data: { banner: number[] } = { banner: [] }
	let organizerInfoEnabled: boolean = false
	let isModalMainSpeaker = false
	let isModalSecondarySpeaker = false
	let isModalVenue = false
	let venues: any[] = []
	export let banner: string | null = null
	export let eventSaved: boolean = false
	export let mainSpeakers: any[] = []
	export let secondarySpeakers: any[] = []
	export let eventId: string | null = null
	export let updateAction: boolean = false

	let venueColumns: Column[] = [
		{
			title: 'Venue name',
			alignHeader: 'center',
			cellComponent: TextWithImageViewer,
			cellDataGenerator: (item) => ({ title: item.name })
		},
		{
			title: 'Location',
			alignHeader: 'center',
			cellComponent: CountryViewer,
			cellDataGenerator: (item) => item.country
		},
		{
			title: 'Address',
			alignHeader: 'center',
			cellComponent: MapViewerPopup,
			cellDataGenerator: (item) => ({
				latitude: item.location.lat,
				longitude: item.location.lng,
				title: item.name
			})
		},
		{
			title: 'Actions',
			cellComponent: ActionsViewer,
			width: '10em',
			grow: '0',
			cellDataGenerator: (item) => {
				return {
					onEdit: () => {
						goto(`/venues/${item.id}/edit`)
					},
					onRemove: () => {
						let index = venues.indexOf(item)
						if (index >= 0) {
							venues.splice(index, 1)
							venues = venues
						}
					}
				}
			}
		}
	]
	let speakerColumns: Column[] = [
		{
			title: '',
			cellComponent: TextWithIcon,
			width: '3em',
			grow: '0',
			cellDataGenerator: (item) => ({ icon: CgMathEqual })
		},
		{
			title: 'Speaker Name',
			alignHeader: 'center',
			cellComponent: TextWithImageViewer,
			cellDataGenerator: (item) => ({ title: item.name, image: item.picture?.url })
		},
		{
			title: 'Actions',
			cellComponent: ActionsViewer,
			width: '10em',
			grow: '0',
			cellDataGenerator: (item) => {
				return {
					onEdit: () => {
						goto(`/speakers/${item.id}/edit`)
					},
					onRemove: () => {
						let index = mainSpeakers.indexOf(item)
						if (index >= 0) {
							mainSpeakers.splice(index, 1)
							mainSpeakers = mainSpeakers
						}
					}
				}
			}
		}
	]
	let speakerColumnsSecondary: Column[] = [
		{
			title: '',
			cellComponent: TextWithIcon,
			width: '3em',
			grow: '0',
			cellDataGenerator: (item) => ({ icon: CgMathEqual })
		},
		{
			title: 'Speaker Name',
			alignHeader: 'center',
			cellComponent: TextWithImageViewer,
			cellDataGenerator: (item) => ({ title: item.name, image: item.picture?.url })
		},
		{
			title: 'Actions',
			cellComponent: ActionsViewer,
			alignHeader: 'center',
			width: '10em',
			grow: '0',
			cellDataGenerator: (item) => {
				return {
					onEdit: () => {
						goto(`/speakers/${item.id}/edit`)
					},
					onRemove: () => {
						let index = secondarySpeakers.indexOf(item)
						if (index >= 0) {
							secondarySpeakers.splice(index, 1)
							secondarySpeakers = secondarySpeakers
						}
					}
				}
			}
		}
	]

	const handleSubmit = async () => {
		if (updateAction) {
			loading = true
			await updateEvent()
			loading = false
		} else {
			loading = true
			await createEvent()
			loading = false
		}
	}

	async function createEvent() {
		try {
			loading = true
			eventData.slug = createSlug(eventData.title)
			eventData.venue = venues
			eventData.speakersSecondary = extractSpeakerIds(secondarySpeakers)
			eventData.speakers = extractSpeakerIds(mainSpeakers)
			if (data.banner.length > 0) {
				eventData.bannerId = createBanner(data.banner)
			}
			eventData.bannerId = eventData.bannerId
			console.log(eventData)
			const res = await fetch(`/api/events`, {
				method: 'POST',
				body: JSON.stringify({ ...eventData })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Event created as draft.', status: true }
				eventSaved = true
				eventId = data.id
				return eventId
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
			loading = false
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
		}
	}

	async function updateEvent() {
		try {
			eventData.slug = createSlug(eventData.title)
			eventData.speakersSecondary = extractSpeakerIds(secondarySpeakers)
			eventData.speakers = extractSpeakerIds(mainSpeakers)
			eventData.organizerId = eventData.organizerId
			console.log(eventData)
			loading = true
			// Es posible que debas incluir el ID del evento en la URL del endpoint, por ejemplo: `/api/events/${eventId}`
			const res = await fetch(`/api/events/${eventId}`, {
				method: 'PUT',
				body: JSON.stringify({ ...eventData })
			})

			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: '¡Éxito! Evento actualizado.', status: true }
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! Ha ocurrido un error. Intenta de nuevo más tarde.',
					status: false
				}
			}

			loading = false
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = {
				message: 'Oops! Ha ocurrido un error. Intenta de nuevo más tarde.',
				status: false
			}
		}
	}

	function createSlug(title: string): string {
		const slug = title.toLowerCase().replace(/\s+/g, '-')
		return slug
	}

	function createBanner(banner: number[]): number {
		const bannerId = Number(banner[0])
		return bannerId
	}

	function extractSpeakerIds(speakers: Speaker[]): number[] {
		return speakers.map((speaker) => speaker.id)
	}
</script>

<div class="content">
	<div class="form-container">
		<LabelInput>Select Organizer</LabelInput>
		<div class="z-50">
			<DropdownFetcher
				name="organizerId"
				filterPlaceholder={'Search'}
				selected={eventData.organizerId}
				itemGenerator={(item) => ({ title: item.name, image: item.logo?.url })}
				selectedGenerator={(item) => ({ title: item.name })}
				bind:value={eventData.organizerId}
				placeholder={'Select the organizer for this event'}
				url={'/api/organizers?search={s}&limit={l}&offset={o}'}
			/>
		</div>
		<div class="flex flex-col gap-8 mt-4 sm:flex-row">
			<div class="w-full">
				<LabelInput>Your event is ...</LabelInput>
				<div class="flex gap-4 sm:gap-8 mt-6 flex-col sm:flex-row">
					{#each typeEvents as typeEvent}
						<label class="flex items-center gap-4">
							<input
								type="radio"
								name="typeEvent"
								bind:group={eventData.typeEvent}
								value={typeEvent.value}
							/>
							{typeEvent.title}</label
						>
					{/each}
				</div>
			</div>
			<div class="w-full">
				<LabelInput>Mark the type of event</LabelInput>
				<div class="flex gap-4 sm:gap-8 mt-6 flex-col sm:flex-row">
					{#each featured as item}
						<label class="flex items-center gap-4">
							<input
								type="radio"
								name="isFeatured"
								bind:group={eventData.isFeatured}
								value={item.value}
							/>
							{item.title}</label
						>
					{/each}
				</div>
			</div>
		</div>
		{#if eventData.typeEvent !== null}
			<div class="input-set">
				<SectionHeader>Event Information</SectionHeader>
				<div>
					<LabelInput>Event title</LabelInput>
					<Input
						bind:value={eventData.title}
						required
						name="title"
						placeholder="Type the event title"
					/>
				</div>
				<div>
					<LabelInput>Write a brief description of the event</LabelInput>
					<Input
						bind:value={eventData.description}
						placeholder="Write a brief description of the event"
					/>
				</div>
			</div>
			<div>
				<SectionHeader>Event Photo</SectionHeader>
				<DragAndDrop
					bind:uploaded={eventData.pictures}
					url="/api/resources"
					name="file"
					title="Upload your image"
					subtitle="PNG, JPG, WEBP, 2MB files are allowed"
					body="600x500"
				/>
			</div>
			<div>
				<SectionHeader>Pin Photo</SectionHeader>
				{#if eventData.pictures}
					<UploadedImage image={banner ?? ''} />
				{:else}
					<DragAndDrop
						bind:uploaded={data.banner}
						url="/api/resources"
						name="file"
						title="Upload your image"
						subtitle="PNG, JPG, WEBP, 2MB files are allowed"
						body="600x500"
					/>
				{/if}
			</div>
			<div class="input-set">
				<SectionHeader>Schedule</SectionHeader>
				<div>
					<LabelInput>Date starts</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={eventData.schedule.startTime}
					/>
				</div>
				<div>
					<LabelInput>Date ends</LabelInput>
					<DatePicker
						placeholder="Choose the end date"
						bind:value={eventData.schedule.endTime}
					/>
				</div>
				<div>
					<LabelInput>Event registration date opens</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={eventData.schedule.visibleAt}
					/>
				</div>
			</div>
			<div class="input-set">
				<SectionHeader>Speakers</SectionHeader>
				<div>
					<LabelInput>Primary Speaker</LabelInput>
					<div class="flex gap-2">
						<div class="w-full">
							<DropdownFetcher
								filterPlaceholder={'Search'}
								itemGenerator={(item) => ({
									title: item.name,
									image: item.picture?.url
								})}
								selectedGenerator={(item) => ({ title: item.name })}
								valueGenerator={(item) => item.id}
								placeholder={'Choose a primary speaker'}
								url={'/api/speakers?search={s}&limit={l}&offset={o}'}
								multiselect={false}
								on:change={(e) => {
									e.preventDefault()
									const speaker = e.detail.selected
									if (!mainSpeakers.some((item) => item.id == speaker.id)) {
										mainSpeakers.push(speaker)
										mainSpeakers = mainSpeakers
									}
								}}
							/>
						</div>
						<MainButton fit on:click={() => (isModalMainSpeaker = true)}
							>Create</MainButton
						>
						<SpeakersFormModal
							isOpen={isModalMainSpeaker}
							on:save={(event) => {
								const speaker = event.detail
								if (!mainSpeakers.some((item) => item.id == speaker.id)) {
									mainSpeakers.push(speaker)
									mainSpeakers = extractSpeakerIds(mainSpeakers)
								}
							}}
							handleClose={() => (isModalMainSpeaker = false)}
						/>
					</div>
				</div>
				<div>
					<OrderableTable columns={speakerColumns} data={mainSpeakers} />
				</div>
				<div>
					<LabelInput>Secondary Speaker</LabelInput>
					<div class="flex gap-2">
						<div class="w-full">
							<DropdownFetcher
								filterPlaceholder={'Search'}
								itemGenerator={(item) => ({
									title: item.name,
									image: item.picture?.url
								})}
								selectedGenerator={(item) => ({ title: item.name })}
								valueGenerator={(item) => item.id}
								placeholder={'Choose a secondary speaker'}
								url={'/api/speakers?search={s}&limit={l}&offset={o}'}
								multiselect={false}
								on:change={(e) => {
									e.preventDefault()
									const speaker = e.detail.selected
									if (!secondarySpeakers.some((item) => item.id == speaker.id)) {
										secondarySpeakers.push(speaker)
										secondarySpeakers = secondarySpeakers
									}
								}}
							/>
						</div>
						<MainButton fit on:click={() => (isModalSecondarySpeaker = true)}
							>Create</MainButton
						>
						<SpeakersFormModal
							isOpen={isModalSecondarySpeaker}
							on:save={(event) => {
								const speaker = event.detail
								if (!secondarySpeakers.some((item) => item.id == speaker.id)) {
									secondarySpeakers.push(speaker)
									secondarySpeakers = secondarySpeakers
								}
							}}
							handleClose={() => (isModalSecondarySpeaker = false)}
						/>
					</div>
				</div>
				<div>
					<OrderableTable columns={speakerColumnsSecondary} data={secondarySpeakers} />
				</div>
				<div>
					<LabelInput>Insert the invitation zoom link</LabelInput>

					<Input bind:value={eventData.linkZoom} placeholder="Insert zoom link" />
				</div>
			</div>

			<div class="input-set">
				<SectionHeader>Venue</SectionHeader>
				<div>
					<LabelInput>Venue</LabelInput>
					<div class="flex gap-2">
						<div class="w-full">
							<DropdownFetcher
								filterPlaceholder={'Search'}
								itemGenerator={(item) => ({ title: item.name })}
								valueGenerator={(item) => item.id}
								selectedGenerator={(item) => ({ title: item.name })}
								placeholder={'Choose a venue'}
								url={'/api/venues'}
								multiselect={false}
								selected={eventData.venue ? eventData.venue : null}
								on:change={(e) => {
									const venue = e.detail.selected
									venues = [venue]
								}}
							/>
						</div>
						<MainButton fit on:click={() => (isModalVenue = true)}>Create</MainButton>
						<VenuesFormModal
							isOpen={isModalVenue}
							on:save={(event) => {
								const venue = event.detail
								venues = [venue]
							}}
							handleClose={() => (isModalVenue = false)}
						/>
					</div>
				</div>
				<div>
					<OrderableTable columns={venueColumns} data={venues} />
				</div>
			</div>
			<div class="input-set">
				<SectionHeader>Language</SectionHeader>
				<div>
					<LabelInput>Primary Language</LabelInput>
					<Dropdown
						width="100%"
						items={languages}
						itemViewer={CountryViewer}
						bind:selected={eventData.language}
						selectedGenerator={(item) => ({ title: item.name })}
						itemGenerator={(item) => ({
							iso: item.flagIso,
							nicename: item.name,
							align: 'left'
						})}
					>
						<div slot="title">Select the main language</div>
					</Dropdown>
				</div>
				<div>
					<LabelInput>Translated to</LabelInput>
					<Dropdown
						width="100%"
						items={languages}
						itemViewer={CountryViewer}
						multiselect={true}
						bind:selected={eventData.translation}
						selectedGenerator={(item) => ({ title: item.name })}
						itemGenerator={(item) => ({
							iso: item.flagIso,
							nicename: item.name,
							align: 'left'
						})}
					>
						<div slot="title">Select languages to translate</div>
					</Dropdown>
				</div>
				<div class="flex-grow flex gap-4 flex-wrap">
					{#each eventData.translation as translation, index}
						<Badge
							type="light"
							hideOnClose={false}
							onClose={() => {
								eventData.translation.splice(index, 1)
								eventData.translation = eventData.translation
							}}
						>
							<CountryViewer
								value={{
									iso: translation.flagIso,
									nicename: translation.name,
									padding: '0'
								}}
							/>
						</Badge>
					{/each}
				</div>
			</div>

			<div class="input-set">
				<SectionHeader>Organizer Assigned</SectionHeader>
				<div>
					<LabelInput>Organizer Info</LabelInput>
					<div class="w-[10em]">
						<ToggleButtton
							id="randomIdCuzIsMandatory"
							left={'no'}
							right={'yes'}
							text
							bind:checked={organizerInfoEnabled}
						/>
					</div>
				</div>
				{#if organizerInfoEnabled}
					<div>
						<LabelInput>Type organizer name</LabelInput>
						<Input
							placeholder="Organizer Assigned to this event"
							bind:value={eventData.secondaryOrganizer}
						/>
					</div>
					<div>
						<LabelInput>Description</LabelInput>
						<Input
							placeholder="Organizer Assigned to this event"
							bind:value={eventData.secondaryOrganizerDescription}
						/>
					</div>
				{/if}
			</div>
			<MainButton {loading} on:click={handleSubmit}>Save as draft</MainButton>
			{#if eventSaved}
				<MainButton href={`/events/${eventId}/preview`}>View Preview</MainButton>
			{:else}
				<MainButton disabled={!eventSaved}>View Preview</MainButton>
			{/if}
			<MainButton href={`/`}>Discard</MainButton>
		{/if}
	</div>
</div>

<style lang="scss">
	div {
		font-family: var(--font-dm-Sans);
	}
	.content {
		display: flex;
		align-items: center;
		justify-content: center;
		.form-container {
			width: 100%;
			max-width: 720px;
			padding: 1em;
			display: flex;
			flex-flow: column;
			gap: 1em;
		}
		.input-set {
			display: flex;
			flex-flow: column;
			gap: 1em;
		}
	}
</style>
