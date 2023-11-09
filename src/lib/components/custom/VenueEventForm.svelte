<script context="module" lang="ts">
	interface Venue {
		id?: number
		name: string
		city: string
		address: string
		location: { lat: string; lng: string }
		description: string
		pictures: number[]
		regionId?: number | undefined
		countryId?: number | any
		copy: boolean
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
	let countries: CountryData[] = []
	interface CountryData {
		id: number
		iso: string
		iso3: string
		nicename: string
	}
	import { REGIONS } from '$lib/utils/constants/Regions'
	import Dropdown from '../Dropdown.svelte'
	import { onMount } from 'svelte'
	// State
	let venue: Venue = {
		name: '',
		city: '',
		address: '',
		location: { lat: '', lng: '' },
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
		geoData.city = addVenue.city
		geoData.address = addVenue.address
		geoData.location.lng = addVenue.location.lng
		geoData.location.lat = addVenue.location.lat
		venue.description = addVenue.description
		venue.regionId = addVenue.region.id
		venue.countryId = addVenue.countryId
		venue.copy = addVenue.copy
		originalVenue = addVenue
	}

	const handleSubmit = async () => {
		loading = true
		const editedVenue = await createEditedVenue()
		editedVenue.city = geoData.city
		editedVenue.address = geoData.address
		editedVenue.location.lat = geoData.location.lat
		editedVenue.location.lng = geoData.location.lng
		if (editAction) {
			editedVenue.pictures = venue.pictures
			await editAction(editedVenue)
		}
		console.log(editedVenue)
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

	async function fetchCountries() {
		try {
			const response = await fetch('/api/countries')
			if (response.ok) {
				countries = await response.json()
			} else {
				console.error('Error')
			}
		} catch (error) {
			console.error('Error', error)
		}
	}

	onMount(async () => {
		await fetchCountries()
	})
</script>

<form
	autocomplete="off"
	on:change={updateVenue}
	on:submit|preventDefault={handleSubmit}
	class="flex min-w-[500px] max-w-[650px] flex-col w-full gap-5"
>
	<Input required label="Venue name" type="text" name="name" bind:value={venue.name} />
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Venue region'}
	</span>
	<div class="grid grid-cols-3 gap-y-5 pb-5">
		{#each REGIONS as region}
			<label class="flex w-full gap-2">
				<input
					name="regionId"
					checked={region.id == venue.regionId}
					bind:value={venue.regionId}
					on:change={() => {
						venue.regionId = region.id
					}}
					type="radio"
				/>
				<span class="text-neutral-4 font-light text-sm tracking-[0.5px]">
					{region.name}
				</span>
			</label>
		{/each}
	</div>
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Country'}
	</span>
	<Dropdown
		required
		on:change={customUpdate}
		name="country"
		selected={{
			value: venue.countryId ?? 0,
			title: venue.countryId
				? countries[venue.countryId - 1]?.nicename
				: 'Choose the Venue country'
		}}
		width="100%"
		bind:value={venue.countryId}
		items={countries.map((country) => {
			return { value: country.id, title: country.nicename ?? '' }
		})}
	/>
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
