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
		copy: boolean
		region: { id: number | null; name: string }
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
	import Editor from './Editor.svelte'
	import ToggleButtton from '../ToggleButtton.svelte'
	// Icons
	import FiAlertOctagon from 'svelte-icons-pack/fi/FiAlertOctagon'
	import { pageAlert } from '$lib/stores/pageStatus'
	// Props
	export let addVenue: any = null
	export let editAction: ((speaker) => Promise<void> | null) | null = null
	let extraPictures = []
	let updatedVenue = {}
	let loading = false
	const onCancel = () => {}
	export let onClose = () => {}
	let additionalPhotos = false
	let originalVenue: any
	// State
	let venue: Venue = {
		name: '',
		country: '',
		city: '',
		address: '',
		location: { lat: '', lng: '' },
		region: { id: null, name: '' },
		description: '',
		pictures: [],
		copy: false
	}
	let geoData = {
		country: '',
		city: '',
		address: '',
		location: { lat: '', lng: '' }
	}

	if (addVenue) {
		venue.id = addVenue.id
		venue.name = addVenue.name
		geoData.country = addVenue.country?.nicename
		venue.name = addVenue.name
		venue.region = addVenue.region
		geoData.city = addVenue.city
		geoData.address = addVenue.address
		geoData.location.lng = addVenue.location.lng
		geoData.location.lat = addVenue.location.lat
		venue.description = addVenue.description
		venue.copy = addVenue.copy
		originalVenue = addVenue
	}

	const handleSubmit = async () => {
		loading = true
		const editedVenue = await createEditedVenue()
		editedVenue.city = geoData.city
		editedVenue.address = geoData.address
		editedVenue.country = geoData.country
		editedVenue.location.lat = geoData.location.lat
		editedVenue.location.lng = geoData.location.lng
		if (editAction) {
			await editAction(editedVenue)
		}
		$pageAlert = { message: 'Success! Changes saved', status: true }
	}

	const updateVenue = (e) => {
		const { name, value } = e.target
		updatedVenue = {
			...updatedVenue,
			[name]: value
		}
	}

	const customUpdate = (e) => {
		updatedVenue[e.detail.name] = e.detail.value
	}

	function createEditedVenue() {
		return {
			...venue,
			...updatedVenue
		}
	}

	const deletePicture = () => {
		addVenue.pictures = []
	}
</script>

<form
	autocomplete="off"
	on:change={updateVenue}
	on:submit|preventDefault={handleSubmit}
	class="flex min-w-[500px] max-w-[650px] flex-col w-full gap-5"
>
	<Input required label="Venue name" type="text" name="name" bind:value={venue.name} />
	<div class="flex flex-col w-full gap-2 pb-12">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Venue Description'}
		</span>
		<Editor on:change={customUpdate} name="description" bind:value={venue.description} />
	</div>
	<div class="flex flex-col text-neutral-4 w-full gap-2">
		<h2 class="text-3xl mb-5">
			{'Featured venue photo'}
		</h2>
		<div class="text-neutral-4 w-full flex justify-center py-3">
			<h2 class="text-2xl">
				{'Venue featured photo'}
			</h2>
		</div>
		{#if addVenue?.pictures?.length}
			<UploadedImage clickAction={deletePicture} image={addVenue.pictures[0]?.url ?? ''} />
		{:else}
			<DragAndDrop
				multiple={false}
				bind:uploaded={venue.pictures}
				url="/api/resources"
				name="pictures"
				title="Upload your image"
				subtitle="PNG, JPG, WEBP, 2MB files are allowed"
				body="510x410"
			/>
		{/if}
		<div class="w-full flex gap-5 my-3 items-center">
			<span class="text-neutral-4 font-normal text-sm tracking-[0.5px] w-fit">
				{'Show additional photos?'}
			</span>
			<div class="w-fit">
				<ToggleButtton
					bind:checked={additionalPhotos}
					id="id1"
					text
					right="Yes"
					left="No"
				/>
			</div>
		</div>
		<span class="text-neutral-3 font-normal text-sm tracking-[0.5px] max-w-[500px] my-3">
			{'A minimum of 3 photos needs to be uploaded & a maximum of 5 photos. If not there will be instead by default random pictures there.'}
		</span>
		{#if additionalPhotos}
			<div class="text-neutral-4 w-full flex justify-center py-3">
				<h2 class="text-2xl">
					{'Venue optional photos'}
				</h2>
			</div>
			<DragAndDrop
				bind:uploaded={extraPictures}
				url="/api/resources"
				name="pictures"
				title="Upload your image"
				subtitle="PNG, JPG, WEBP, 2MB files are allowed"
				body="700x410"
			/>
			<span
				class="w-full h-10 rounded-xl bg-alert-warning my-3 text-sm flex items-center pl-5 gap-3"
			>
				<Icon src={FiAlertOctagon} />
				{'Remember It is mandatory to upload at least 3 photos'}
			</span>
		{/if}
	</div>
	<div class="flex gap-10">
		<MainButton type="submit" {loading}>Save</MainButton>
		<MainButton type="button" on:click={onClose}>Cancel</MainButton>
	</div>
</form>
