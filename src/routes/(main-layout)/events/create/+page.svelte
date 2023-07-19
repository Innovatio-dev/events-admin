<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte'
	import DragAndDrop from '$lib/components/DragAndDrop.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import DropdownFetcher from '$lib/components/DropdownFetcher.svelte'
	import Input from '$lib/components/Input.svelte'
	import LabelInput from '$lib/components/LabelInput.svelte'
	import SectionHeader from '$lib/components/SectionHeader.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'

	export let data

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

	let mainSpeaker: any = null

	onMount(() => {
		$pageStatus.title = 'Create an Event'
	})
	$: {
		console.log(event)
	}
</script>

<div class="content">
	<div class="form-container">
		<LabelInput>Select Organizer</LabelInput>
		<div class="z-50">
			<Dropdown
				name="organizerId"
				width="100%"
				filterable={true}
				filterPlaceholder={'Search'}
				bind:value={event.organizerId}
				items={data.organizers.results.map((organizer) => ({
					title: organizer.name,
					image: organizer.logo?.url,
					value: organizer.id
				}))}
			>
				<svelte:fragment slot="title">Select the organizer</svelte:fragment></Dropdown
			>
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
						bind:selected={mainSpeaker}
						placeholder={'Select the main speaker'}
						searchField={'search'}
						valueField={'id'}
						titleField={'name'}
						url={'/api/speakers'}
					/>
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
