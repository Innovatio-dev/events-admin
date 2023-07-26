<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte'
	import DragAndDrop from '$lib/components/DragAndDrop.svelte'
	import DropdownFetcher from '$lib/components/DropdownFetcher.svelte'
	import Input from '$lib/components/Input.svelte'
	import LabelInput from '$lib/components/LabelInput.svelte'
	import OrderableTable, { type Column } from '$lib/components/OrderableTable.svelte'
	import SectionHeader from '$lib/components/SectionHeader.svelte'
	import TextWithIcon from '$lib/components/table_cell/TextWithIcon.svelte'
	import CgMathEqual from 'svelte-icons-pack/cg/CgMathEqual'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import ActionsViewer from '$lib/components/table_cell/ActionsViewer.svelte'
	import TextWithImageViewer from '$lib/components/custom/data_viewer/TextWithImageViewer.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
	import MapViewerPopup from '$lib/components/table_cell/MapViewerPopup.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import { languages } from '$lib/utils/constants/Languages'
	import Badge from '$lib/components/Badge.svelte'
	import ToggleButtton from '$lib/components/ToggleButtton.svelte'

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
			value: 1
		},
		{
			title: 'Regular',
			value: 0
		}
	]
	let organizerInfoEnabled: boolean = false
	const event: {
		organizerId: string
		typeEvent: string | null
		isFeatured: number
		title: string
		description: string
		bannerId: any[]
		pictures: any[]
		linkZoom: any
		language: any
		translation: { name: string; flagIso: string }[]
		secondaryOrganizer: string | null
		secondaryOrganizerDescription: string | null
	} = {
		organizerId: '',
		typeEvent: null,
		isFeatured: 0,
		title: '',
		description: '',
		bannerId: [],
		pictures: [],
		linkZoom: null,
		language: null,
		translation: [],
		secondaryOrganizer: null,
		secondaryOrganizerDescription: null
	}
	const schedule = {
		startTime: null,
		endTime: null,
		visibleAt: null
	}

	let mainSpeakers: any[] = []
	let secondarySpeakers: any = []
	let venues: any[] = []

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
	onMount(() => {
		$pageStatus.title = 'Create an Event'
	})
	$: {
		// console.log(event)
		// console.log(mainSpeakers)
	}
</script>

<div class="content">
	<div class="form-container">
		<LabelInput>Select Organizer</LabelInput>
		<div class="z-50">
			<DropdownFetcher
				name="organizerId"
				filterPlaceholder={'Search'}
				itemGenerator={(item) => ({ title: item.name, image: item.logo?.url })}
				selectedGenerator={(item) => ({ title: item.name })}
				bind:value={event.organizerId}
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
								bind:group={event.typeEvent}
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
								bind:group={event.isFeatured}
								value={item.value}
							/>
							{item.title}</label
						>
					{/each}
				</div>
			</div>
		</div>
		{#if event.typeEvent !== null}
			<div class="input-set">
				<SectionHeader>Event Information</SectionHeader>
				<div>
					<LabelInput>Event title</LabelInput>
					<Input bind:value={event.title} placeholder="Type the event title" />
				</div>
				<div>
					<LabelInput>Write a brief description of the event</LabelInput>
					<Input
						bind:value={event.description}
						placeholder="Write a brief description of the event"
					/>
				</div>
			</div>
			<div>
				<SectionHeader>Event Photo</SectionHeader>
				<DragAndDrop
					bind:uploaded={event.pictures}
					url="/api/resources"
					name="file"
					title="Upload your image"
					subtitle="PNG, JPG, WEBP, 2MB files are allowed"
					body="600x500"
				/>
			</div>
			<div>
				<SectionHeader>Pin Photo</SectionHeader>
				<DragAndDrop
					bind:uploaded={event.bannerId}
					url="/api/resources"
					name="file"
					title="Upload your image"
					subtitle="PNG, JPG, WEBP, 2MB files are allowed"
					body="600x500"
				/>
			</div>
			<div class="input-set">
				<SectionHeader>Schedule</SectionHeader>
				<div>
					<LabelInput>Date starts</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={schedule.startTime}
					/>
				</div>
				<div>
					<LabelInput>Date ends</LabelInput>
					<DatePicker placeholder="Choose the end date" bind:value={schedule.endTime} />
				</div>
				<div>
					<LabelInput>Event registration date opens</LabelInput>
					<DatePicker
						placeholder="Choose the start date"
						bind:value={schedule.visibleAt}
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
						<MainButton href="/speakers/create">Create</MainButton>
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
						<MainButton href="/speakers/create">Create</MainButton>
					</div>
				</div>
				<div>
					<OrderableTable columns={speakerColumnsSecondary} data={secondarySpeakers} />
				</div>
				<div>
					<LabelInput>Insert the invitation zoom link</LabelInput>

					<Input bind:value={event.linkZoom} placeholder="Insert zoom link" />
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
								selected={venues.length ? venues[0] : null}
								on:change={(e) => {
									const venue = e.detail.selected
									venues = [venue]
								}}
							/>
						</div>
						<MainButton href="/venues/create">Create</MainButton>
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
						bind:selected={event.language}
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
						bind:selected={event.translation}
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
					{#each event.translation as translation, index}
						<Badge
							type="light"
							hideOnClose={false}
							onClose={() => {
								event.translation.splice(index, 1)
								event.translation = event.translation
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
							id="asd"
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
							bind:value={event.secondaryOrganizer}
						/>
					</div>
					<div>
						<LabelInput>Description</LabelInput>
						<Input
							placeholder="Organizer Assigned to this event"
							bind:value={event.secondaryOrganizerDescription}
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
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
