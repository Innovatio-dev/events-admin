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
	const event = {
		organizerId: '',
		typeEvent: null,
		isFeatured: 0,
		title: '',
		description: '',
		bannerId: [],
		pictures: []
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
			width: 'fit-content',
			grow: '0',
			cellDataGenerator: (item) => ({ icon: CgMathEqual })
		},
		{
			title: 'Speaker Name',
			alignHeader: 'start',
			cellComponent: TextWithImageViewer,
			cellDataGenerator: (item) => ({ title: item.name, image: item.picture?.url })
		},
		{
			title: 'Actions',
			cellComponent: ActionsViewer,
			width: 'fit-content',
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
			width: 'fit-content',
			grow: '0',
			cellDataGenerator: (item) => ({ icon: CgMathEqual })
		},
		{
			title: 'Speaker Name',
			alignHeader: 'start',
			cellComponent: TextWithImageViewer,
			cellDataGenerator: (item) => ({ title: item.name, image: item.picture?.url })
		},
		{
			title: 'Actions',
			cellComponent: ActionsViewer,
			width: 'fit-content',
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
				bind:value={event.organizerId}
				placeholder={'Select the organizer for this event'}
				url={'/api/organizers'}
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
			</div>
			<div class="input-set">
				<SectionHeader>Speakers</SectionHeader>
				<div>
					<LabelInput>Primary Speaker</LabelInput>
					<DropdownFetcher
						filterPlaceholder={'Search'}
						itemGenerator={(item) => ({ title: item.name, image: item.picture?.url })}
						valueGenerator={(item) => item.id}
						placeholder={'Choose a primary speaker'}
						searchField={'search'}
						url={'/api/speakers'}
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
				<div>
					<OrderableTable columns={speakerColumns} data={mainSpeakers} />
				</div>
				<div>
					<LabelInput>Secondary Speaker</LabelInput>
					<DropdownFetcher
						filterPlaceholder={'Search'}
						itemGenerator={(item) => ({ title: item.name, image: item.picture?.url })}
						valueGenerator={(item) => item.id}
						placeholder={'Choose a secondary speaker'}
						searchField={'search'}
						url={'/api/speakers'}
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
				<div>
					<OrderableTable columns={speakerColumnsSecondary} data={secondarySpeakers} />
				</div>
			</div>

			<div class="input-set">
				<SectionHeader>Venue</SectionHeader>
				<div>
					<LabelInput>Venue</LabelInput>
					<DropdownFetcher
						filterPlaceholder={'Search'}
						itemGenerator={(item) => ({ title: item.name })}
						valueGenerator={(item) => item.id}
						placeholder={'Choose a venue'}
						searchField={'search'}
						url={'/api/venues'}
						multiselect={false}
						on:change={(e) => {
							e.preventDefault()
							const venue = e.detail.selected
							if (!venues.some((item) => item.id == venue.id)) {
								venues.push(venue)
								venues = venues
							}
						}}
					/>
				</div>
				<div>
					<!-- <OrderableTable columns={speakerColumns} data={mainSpeakers} /> -->
				</div>
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
