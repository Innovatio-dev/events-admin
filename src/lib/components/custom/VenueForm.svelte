<script context="module" lang="ts">
	interface Venue {
		id?: number
		name: string
		country: string
		city: string
		address: string
		location: { lat: string; lng: string }
		description: string
		pictures: number[]
	}
</script>

<script lang="ts">
	// Components
	import Input from '$lib/components/Input.svelte'
	import Icon from 'svelte-icons-pack/Icon.svelte'
	import DragAndDrop from '../DragAndDrop.svelte'
	import MainButton from '../MainButton.svelte'
	import LocationInput from './LocationInput.svelte'
	import UploadedImage from './UploadedImage.svelte'
	// Constants
	import ToggleButtton from '../ToggleButtton.svelte'
	// Icons
	import FiAlertOctagon from 'svelte-icons-pack/fi/FiAlertOctagon'
	import Editor from './Editor.svelte'

	// Props
	export let addVenue: any = null
	export let updateAction: any = null
	export let submitAction = (venue) => {}

	// State
	let venue: Venue = {
		name: '',
		country: '',
		city: '',
		address: '',
		location: { lat: '', lng: '' },
		description: '',
		pictures: []
	}
	let geoData = {
		country: '',
		city: '',
		address: '',
		location: { lat: '', lng: '' }
	}
	let extraPictures = []
	let updatedVenue = {}
	let loading = false

	if (addVenue) {
		venue.id = addVenue.id
		venue.name = addVenue.name
		geoData.country = addVenue.country.nicename
		venue.name = addVenue.name
		geoData.city = addVenue.city
		geoData.address = addVenue.address
		geoData.location.lng = addVenue.location.lng
		geoData.location.lat = addVenue.location.lat
		venue.description = addVenue.description
	}

	const handleSubmit = async () => {
		if (updateAction) {
			loading = true
			await updateAction(venue?.id ?? 0, updatedVenue)
			loading = false
		} else {
			loading = true
			const formattedData = {
				...venue,
				...geoData,
				pictures: [venue.pictures[0], ...extraPictures]
			}
			await submitAction(formattedData)
			loading = false
		}
	}

	const updateVenue = (e) => {
		updatedVenue[e.target.name] = e.target.value
	}

	const onCancel = () => {}
</script>

<form
	on:change={updateVenue}
	on:submit|preventDefault={handleSubmit}
	class="flex min-w-[500px] flex-col w-full gap-5"
>
	<Input required label="Venue name" type="text" name="name" bind:value={venue.name} />
	<LocationInput bind:data={geoData} />
	<Input label="Venue country" type="text" name="country" bind:value={geoData.country} />
	<Input label="Venue city" type="text" name="city" bind:value={geoData.city} />
	<Input label="Venue address" type="text" name="address" bind:value={geoData.address} />
	<Input
		required
		disabled
		label="Venue location"
		type="text"
		value={`${geoData.location.lat}, ${geoData.location.lng}`}
	/>
	<div class="flex flex-col w-full gap-2">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Venue Description'}
		</span>
		<!-- <textarea
			required
			class="min-h-[150px]"
			name="description"
			bind:value={venue.description}
		/> -->
		<Editor name="description" bind:value={venue.description} />
	</div>
	<div class="flex flex-col w-full gap-2">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Featured venue photo'}
		</span>
		<div class="text-neutral-4 w-full flex justify-center py-3">
			<h2 class="text-2xl">
				{'Venue featured photo'}
			</h2>
		</div>
		{#if addVenue}
			<UploadedImage image={addVenue.pictures[0]?.url ?? ''} />
		{:else}
			<DragAndDrop
				multiple={false}
				bind:uploaded={extraPictures}
				url="/api/resources"
				name="file"
				title="Upload your image"
				subtitle="PNG, JPG, WEBP, 2MB files are allowed"
				body="1000x1000"
			/>
		{/if}
		<div class="w-full flex gap-5 my-3 items-center">
			<span class="text-neutral-4 font-normal text-sm tracking-[0.5px] w-fit">
				{'Show additional photos?'}
			</span>
			<div class="w-fit">
				<ToggleButtton checked={false} id="id1" text right="Yes" left="No" />
			</div>
		</div>
		<span class="text-neutral-3 font-normal text-sm tracking-[0.5px] max-w-[500px] my-3">
			{'A minimum of 3 photos needs to be uploaded & a maximum of 5 photos. If not there will be instead by default random pictures there.'}
		</span>
		<div class="text-neutral-4 w-full flex justify-center py-3">
			<h2 class="text-2xl">
				{'Venue optional photos'}
			</h2>
		</div>
		<DragAndDrop
			bind:uploaded={venue.pictures}
			url="/api/resources"
			name="file"
			title="Upload your image"
			subtitle="PNG, JPG, WEBP, 2MB files are allowed"
			body="600x500"
		/>
		<span
			class="w-full h-10 rounded-xl bg-alert-warning my-3 text-sm flex items-center pl-5 gap-3"
		>
			<Icon src={FiAlertOctagon} />
			{'Remember It is mandatory to upload at least 3 photos'}
		</span>
	</div>
	<div class="flex gap-10">
		<MainButton {loading}>Save</MainButton>
		<MainButton on:click={onCancel}>cancel</MainButton>
	</div>
</form>

<style lang="scss">
	textarea {
		font-size: 0.9rem;
		border-radius: 10px;
		padding: 0.7rem calc(0.6rem * 20 / 12);
		border: 2px solid var(--input-outline);
		background-color: var(--input-bg);
		color: var(--input-text);
		font-weight: 400;
		font-size: 0.9rem;
		transition: border 0.3s ease-in-out;
		outline: none;
		&:focus {
			border: 2px solid var(--input-text);
		}
	}
</style>
