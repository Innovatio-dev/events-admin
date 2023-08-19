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
		secondaryOrganizerDescription: string
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
	import Editor from './Editor.svelte'

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
	let venueSelected = null
	let speakerSelected = null
	let isModalSecondarySpeaker = false
	let isModalVenue = false
	let venues: any[] = []
	let validate: boolean = false
	export let mainSpeakers: any[] = []
	export let secondarySpeakers: any[] = []
	export let eventId: string | null = null

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
						isModalVenue = true
						venueSelected = item
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
						isModalMainSpeaker = true
						speakerSelected = item
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
						isModalSecondarySpeaker = true
						speakerSelected = item
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
		loading = true
		await createEvent()
		loading = false
		if (eventId) {
			goto(`/events/${eventId}`)
		}
	}

	const viewPreview = async () => {
		loading = true
		await createEvent()
		loading = false
		if (eventId) {
			goto(`/events/${eventId}/preview`)
		}
	}

	async function createEvent() {
		try {
			loading = true
			eventData.slug = createSlug(eventData?.title)
			eventData.venue = venues
			eventData.speakersSecondary = secondarySpeakers
			eventData.speakers = mainSpeakers
			if (data.banner.length > 0) {
				eventData.bannerId = createBanner(data.banner)
			}
			eventData.bannerId = eventData.bannerId
			const res = await fetch(`/api/events`, {
				method: 'POST',
				body: JSON.stringify({ ...eventData })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Event created as draft.', status: true }
				eventId = data.id
				return eventId
			} else {
				const errorResponse = await res.json() // Almacenar la respuesta de error en una variable
				$pageAlert = {
					message:
						errorResponse.message == 'Validation error'
							? 'Please fill out all required fields.'
							: errorResponse.message,
					status: false
				}
			}
			loading = false
			validate = true
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
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

	function handleClose() {
		mainSpeakers = [...mainSpeakers]
		isModalMainSpeaker = false
	}

	function handleCloseSecondary() {
		secondarySpeakers = [...secondarySpeakers]
		isModalSecondarySpeaker = false
	}

	function handleCloseVenue() {
		venues = [...venues]
		isModalVenue = false
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
			{#if eventData.organizerId.length < 1 && validate}
				<span class="text-xs text-alert-error">* Organizer is required</span>
			{/if}
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
					{#if eventData.title.length < 3 && validate}
						<span class="text-xs text-alert-error">* Event title is required</span>
					{/if}
				</div>
				<div class="flex flex-col w-full gap-2 pb-10">
					<LabelInput>Write a brief description of the event</LabelInput>
					<Editor bind:value={eventData.description} name="description" />
					{#if eventData.description.length < 12 && !validate}
						<span class="text-xs text-alert-error pt-12"
							>* Event description is required</span
						>
					{/if}
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
					multiple={true}
				/>
			</div>
			<div>
				<SectionHeader>Pin Photo</SectionHeader>
				<DragAndDrop
					bind:uploaded={data.banner}
					url="/api/resources"
					name="file"
					title="Upload your image"
					subtitle="PNG, JPG, WEBP, 2MB files are allowed"
					body="600x500"
					multiple={false}
				/>
			</div>
			<div class="input-set">
				<SectionHeader>Schedule</SectionHeader>
				<div>
					<LabelInput>Date starts</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={eventData.schedule.startTime}
					/>

					{#if eventData?.schedule.startTime == null && validate}
						<span class="text-xs text-alert-error">* Date start is required</span>
					{/if}
				</div>
				<div>
					<LabelInput>Date ends</LabelInput>
					<DatePicker
						placeholder="Choose the end date"
						bind:value={eventData.schedule.endTime}
					/>
					{#if eventData?.schedule.endTime == null && validate}
						<span class="text-xs text-alert-error">* Date ends is required</span>
					{/if}
				</div>
				<div>
					<LabelInput>Event registration date opens</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={eventData.schedule.visibleAt}
					/>
					{#if eventData?.schedule.visibleAt == null && validate}
						<span class="text-xs text-alert-error">* Date opens is required</span>
					{/if}
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
							speaker={speakerSelected}
							speakers={mainSpeakers}
							on:save={(event) => {
								const speaker = event.detail
								if (!mainSpeakers.some((item) => item.id == speaker.id)) {
									mainSpeakers = [...mainSpeakers, speaker]
								}
							}}
							{handleClose}
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
							speaker={speakerSelected}
							speakers={secondarySpeakers}
							on:save={(event) => {
								const speaker = event.detail
								if (!secondarySpeakers.some((item) => item.id == speaker.id)) {
									secondarySpeakers = [...secondarySpeakers, speaker]
								}
							}}
							handleClose={handleCloseSecondary}
						/>
					</div>
				</div>
				<div>
					<OrderableTable columns={speakerColumnsSecondary} data={secondarySpeakers} />
				</div>
				{#if eventData?.typeEvent == '0'}
					<div>
						<LabelInput>Insert the invitation zoom link</LabelInput>
						<Input bind:value={eventData.linkZoom} placeholder="Insert zoom link" />
						{#if eventData?.linkZoom == null && validate}
							<span class="text-xs text-alert-error">* Zoom link is required</span>
						{/if}
					</div>
				{/if}
			</div>
			{#if eventData?.typeEvent == '1'}
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
							<MainButton fit on:click={() => (isModalVenue = true)}
								>Create</MainButton
							>
							<VenuesFormModal
								isOpen={isModalVenue}
								venue={venueSelected}
								handleCloseModal={handleCloseVenue}
								on:save={(event) => {
									const venue = event.detail
									venues = [venue]
								}}
								handleClose={() => {
									isModalVenue = false
								}}
							/>
						</div>
					</div>
					<div>
						<OrderableTable columns={venueColumns} data={venues} />
					</div>
				</div>
			{/if}
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
					{#if eventData?.language == null && validate}
						<span class="text-xs text-alert-error">* Language is required</span>
					{/if}
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
			<!-- Secondary Organizer -->
			<!-- <div class="input-set">
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
					<div class="flex flex-col w-full gap-2 pb-12">
						<LabelInput>Description</LabelInput>
						<Editor
							bind:value={eventData.secondaryOrganizerDescription}
							name="secondaryOrganizerDescription"
						/>
					</div>
				{/if}
			</div> -->
			<MainButton {loading} on:click={handleSubmit}>Save as draft</MainButton>
			<MainButton {loading} on:click={viewPreview}>View Preview</MainButton>
			<MainButton href={`/events`}>Discard</MainButton>
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
