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
		translation: {
			flagIso: string
			name: string
		}[]
		secondaryOrganizer: string | null
		secondaryOrganizerDescription: string
		speakers: any[]
		speakersSecondary: any[]
		schedule: { startTime: Date | null; endTime: Date | null; visibleAt: Date | null }
	}
</script>

<script lang="ts">
	// Utils
	import { languages } from '$lib/utils/constants/Languages'
	import { pageAlert } from '$lib/stores/pageStatus'
	import { goto } from '$app/navigation'
	// Components
	import ActionsViewer from '$lib/components/table_cell/ActionsViewer.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
	import MapViewerPopup from '$lib/components/table_cell/MapViewerPopup.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import Badge from '$lib/components/Badge.svelte'
	import SpeakersFormModal from '$lib/components/custom/SpeakersFormModal.svelte'
	import DatePicker from '$lib/components/DatePicker.svelte'
	import DragAndDrop from '$lib/components/DragAndDrop.svelte'
	import DropdownFetcher from '$lib/components/DropdownFetcher.svelte'
	import Input from '$lib/components/Input.svelte'
	import LabelInput from '$lib/components/LabelInput.svelte'
	import SectionHeader from '$lib/components/SectionHeader.svelte'
	import TextWithIcon from '$lib/components/table_cell/TextWithIcon.svelte'
	import Editor from './Editor.svelte'
	import UploadedImage from './UploadedImage.svelte'
	import OrderableTable, { type Column } from '$lib/components/OrderableTable.svelte'
	import TextWithImageViewer from '$lib/components/custom/data_viewer/TextWithImageViewer.svelte'
	// import ToggleButtton from '$lib/components/ToggleButtton.svelte'
	// Icons
	import CgMathEqual from 'svelte-icons-pack/cg/CgMathEqual'
	import VenuesEditFormModal from '$lib/components/custom/VenuesEditFormModal.svelte'
	import VenueFormModal from './VenueFormModal.svelte'

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

	interface PictureId {
		id: number
	}
	// Props
	const data: { banner: number[] } = { banner: [] }
	// let organizerInfoEnabled: boolean = false
	let loading = false
	let isModalMainSpeaker = false
	export let venueSelected = null
	let speakerSelected = null
	let isModalSecondarySpeaker = false
	let isModalVenue = false
	let isCreateModalVenue = false
	let venues: any[] | null = null
	let editedVenue: any[] | null = null
	let success: boolean = false
	export let organizerSelected: any[]
	export let eventData: EventData
	export let banner: string | null = null
	export let mainSpeakers: any[] = []
	export let secondarySpeakers: any[] = []
	export let eventId: string | null = null
	export let originalPictures: any[] = []
	let newPictures: any[] = []

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
						let index = venues?.indexOf(item) ?? 0
						if (index >= 0) {
							venues?.splice(index, 1)
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
		await updateEvent()
		loading = false
		if (success) {
			$pageAlert = {
				message: 'Event updated succesfully.',
				status: true
			}
			goto(`/events/${eventId}`)
		} else {
			$pageAlert = {
				message: 'Oops! An error has occurred. try again later.',
				status: false
			}
		}
	}

	const viewPreview = async () => {
		loading = true
		await updateEvent()
		loading = false
		if (success) {
			$pageAlert = {
				message: 'Event updated succesfully.',
				status: true
			}
			goto(`/events/${eventId}/preview`)
		} else {
			$pageAlert = {
				message: 'Oops! An error has occurred. try again later.',
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

	function removeBanner() {
		banner = null
	}
	function removeImage(index) {
		originalPictures.splice(index, 1)
		originalPictures = originalPictures
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
		isModalVenue = false
	}

	function extractPictureIds(array): number[] {
		let combinedPictures = [...array]
		let ids = combinedPictures.map((item) => item.id)
		return ids
	}

	function updateVenueData(venue) {
		eventData.venue.name = venue.name
		eventData.venue.description = venue.description
		eventData.venue.countryId = venue.countryId
		eventData.venue.regionId = venue.regionId
		if (venue.pictures && venue.pictures.length >= 1) {
			eventData.venue.pictures = venue.pictures
		}
	}

	async function updateEvent() {
		try {
			eventData.slug = createSlug(eventData.title)
			eventData.organizerId = eventData.organizerId
			let arrayIds = extractPictureIds(originalPictures)
			eventData.pictures = [...arrayIds, ...newPictures]
			eventData.speakers = mainSpeakers
			eventData.speakersSecondary = secondarySpeakers
			if (venues) {
				eventData.venue = venues[0]
			}
			if (editedVenue) {
				updateVenueData(editedVenue)
			}
			if (data.banner.length > 0) {
				eventData.bannerId = createBanner(data.banner)
			}
			loading = true
			const res = await fetch(`/api/events/${eventId}`, {
				method: 'PUT',
				body: JSON.stringify({
					...eventData,
					reason: 'SIMPLE UPDATE',
					publishingUpdate: false
				})
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Event updated.', status: true }
				success = true
			} else {
				const errorResponse = await res.json()
				console.log(errorResponse)
				$pageAlert = {
					message:
						errorResponse.message == 'Validation error'
							? 'Please fill out all required fields.'
							: errorResponse.message,
					status: false
				}
			}

			loading = false
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = {
				message: 'Oops!',
				status: false
			}
		}
	}
</script>

<div class="content">
	<div class="form-container">
		<!-- Organizer -->
		<div>
			<LabelInput>Select Organizer Aqui</LabelInput>
			<div class="z-50">
				<DropdownFetcher
					selected={organizerSelected}
					name="organizerId"
					filterPlaceholder={'Search'}
					itemGenerator={(item) => ({ title: item.name, image: item.logo?.url })}
					selectedGenerator={(item) => ({ title: item.name })}
					bind:value={eventData.organizerId}
					placeholder={'Select the organizer for this event'}
					url={'/api/organizers?search={s}&limit={l}&offset={o}'}
				/>
			</div>
		</div>
		<!-- Event Types -->
		<div class="flex flex-col gap-8 mt-4 sm:flex-row">
			<!-- Event Virtual/Live -->
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
			<!-- Featured/Regular -->
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
			<!-- Event Info -->
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
				<div class="flex flex-col w-full gap-2 pb-10">
					<LabelInput>Write a brief description of the event</LabelInput>
					<Editor bind:value={eventData.description} name="description" />
				</div>
			</div>
			<!-- Event Photo -->
			<div class="input-set">
				<SectionHeader>Event Photo</SectionHeader>
				{#if originalPictures}
					<div class="flex flex-wrap items-center justify-center gap-x-6">
						{#each originalPictures as picture, index}
							<div class="flex w-fit py-6">
								<UploadedImage
									image={picture.url}
									clickAction={() => {
										removeImage(index)
									}}
								/>
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="flex justify-center items-center w-full text-lg text-neutral-3 py-6"
					>
						No images found
					</div>
				{/if}
				<DragAndDrop
					bind:uploaded={newPictures}
					url="/api/resources"
					name="file"
					title="Upload your image"
					subtitle="PNG, JPG, WEBP, 2MB files are allowed"
					body="600x500"
					multiple={true}
				/>
			</div>
			<!-- Pin Photo -->
			<div class="input-set">
				<SectionHeader>Pin Photo</SectionHeader>
				{#if banner}
					<UploadedImage image={banner} clickAction={removeBanner} />
				{:else}
					<DragAndDrop
						bind:uploaded={data.banner}
						url="/api/resources"
						name="file"
						title="Upload your image"
						subtitle="PNG, JPG, WEBP, 2MB files are allowed"
						body="600x500"
						multiple={false}
					/>
				{/if}
			</div>
			<!-- Schedule -->
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
			<!-- PrimarySpeakers -->
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
									const existingSpeaker = mainSpeakers.find(
										(item) => item.id === speaker.id
									)
									if (!existingSpeaker) {
										mainSpeakers = [
											...mainSpeakers,
											{ ...speaker, copy: false }
										]
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
							speakers={eventData.speakers}
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
			</div>
			<!-- Secondary Speakers -->
			<div class="input-set">
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
									const existingSpeaker = secondarySpeakers.find(
										(item) => item.id === speaker.id
									)
									if (!existingSpeaker) {
										secondarySpeakers = [
											...secondarySpeakers,
											{ ...speaker, copy: false }
										]
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
								console.log('onsave')
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
			</div>
			<!-- ZoomLink -->
			<div class="input-set">
				{#if eventData?.typeEvent == '0'}
					<div>
						<LabelInput>Insert the invitation zoom link</LabelInput>
						<Input bind:value={eventData.linkZoom} placeholder="Insert zoom link" />
					</div>
				{/if}
			</div>
			<!-- Venue -->
			<div class="input-set">
				{#if eventData?.typeEvent == '1'}
					<SectionHeader>Venue</SectionHeader>
					<div>
						<LabelInput>Venue</LabelInput>
						<div class="flex gap-2">
							<div class="w-full">
								<DropdownFetcher
									filterPlaceholder={'Search'}
									itemGenerator={(item) => ({
										title: item.name
									})}
									valueGenerator={(item) => item.id}
									selected={venues ?? venueSelected}
									selectedGenerator={(item) => ({ title: item.name })}
									placeholder={'Choose a venue'}
									url={'/api/venues'}
									multiselect={false}
									on:change={(e) => {
										const venue = e.detail.selected
										venues = [venue]
									}}
								/>
							</div>
							<MainButton fit on:click={() => (isCreateModalVenue = true)}
								>Create</MainButton
							>
							<VenueFormModal
								isOpen={isCreateModalVenue}
								handleClose={() => {
									isCreateModalVenue = false
								}}
								on:save={(event) => {
									const venue = event.detail
									console.log('save', venue)
								}}
							/>
							<VenuesEditFormModal
								isOpen={isModalVenue}
								venue={venueSelected}
								{venues}
								handleClose={handleCloseVenue}
								on:save={(event) => {
									const savedVenue = event.detail
									editedVenue = savedVenue
									console.log('saved :', editedVenue)
								}}
							/>
						</div>
					</div>
					<div>
						<OrderableTable columns={venueColumns} data={venues ?? [venueSelected]} />
					</div>
				{/if}
			</div>
			<!-- Language -->
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
