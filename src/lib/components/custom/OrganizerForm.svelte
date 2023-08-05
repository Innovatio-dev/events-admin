<script lang="ts">
	// Svelte
	import { goto } from '$app/navigation'
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '../MainButton.svelte'
	import ToggleButtton from '../ToggleButtton.svelte'
	import DragAndDrop from '../DragAndDrop.svelte'
	import UploadedImage from './UploadedImage.svelte'
	import Dropdown from '../Dropdown.svelte'

	// Constants
	import { countries, REGIONS } from '$lib/utils/constants/Regions'

	interface Organizer {
		id?: number
		logo?: any
		status?: number
		isMember: boolean
		mavieId: string
		name: string
		company: string
		phone: string
		email: string
		regions: any[]
		country?: any
		twitter: string
		website: string
		facebook: string
		instagram: string
		youtube: string
		description: string
		countryId: any
		logos: number[]
	}

	// Props
	export let addOrganizer: Organizer | null = null
	export let updateAction: ((id: number, speaker) => Promise<void> | null) | null = null
	export let submitAction = (organizer) => {}

	// State
	let organizer: Organizer = {
		isMember: false,
		mavieId: '',
		name: '',
		company: '',
		phone: '',
		email: '',
		regions: [],
		twitter: '',
		website: '',
		facebook: '',
		instagram: '',
		youtube: '',
		description: '',
		countryId: '',
		logos: []
	}
	let updatedOrganizer = {
		status: addOrganizer?.status,
		reason: 'Organizer updated'
	}
	let loading = false

	if (addOrganizer) {
		organizer = JSON.parse(JSON.stringify(addOrganizer))
		organizer.countryId = addOrganizer.country?.id
	}

	const handleSubmit = async () => {
		if (updateAction) {
			loading = true
			await updateAction(organizer?.id ?? 0, updatedOrganizer)
			loading = false
		} else {
			loading = true
			const formattedData = {
				twitter: 'https://twitter.com/' + organizer.twitter.replace(/\s/g, '_'),
				facebook: 'https://facebook.com/' + organizer.facebook.replace(/\s/g, '_'),
				instagram: 'https://instagram.com/' + organizer.instagram.replace(/\s/g, '_'),
				youtube: 'https://youtube.com/' + organizer.youtube.replace(/\s/g, '_'),
				logoId: organizer.logos[0]
			}
			loading = false
			submitAction({ ...organizer, ...formattedData })
		}
	}

	const updateOrganizer = (e) => {
		updatedOrganizer[e.target.name] = e.target.value
	}

	const handleCheck = (e: any) => {
		if (e.target.checked) {
			organizer.regions.push(e.target.value)
		} else {
			organizer.regions.forEach((region, i) => {
				if (region === e.target.value) {
					organizer.regions.splice(i, 1)
				}
			})
		}
	}

	function organizerHasRegion(regionId) {
		return organizer.regions.findIndex((region, index) => region.id == regionId) != -1
	}

	const onCancel = () => {}
</script>

<form
	on:change={updateOrganizer}
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col w-full gap-5"
>
	<div class="flex justify-between items-center">
		<div
			class="flex w-full items-center gap-12 text-neutral-4 font-light text-sm tracking-[0.5px]"
		>
			<span>
				{'Mavie Member'}
			</span>
			<ToggleButtton bind:checked={organizer.isMember} id="tid1" text right="Yes" left="No" />
		</div>
		<div>
			<Input label="Mavie Id:" type="number" name="mavieId" bind:value={organizer.mavieId} />
		</div>
	</div>
	<Input
		required
		label="Organizer full name:"
		type="text"
		name="name"
		bind:value={organizer.name}
	/>
	<Input
		required
		label="Organizer company name:"
		type="text"
		name="company"
		bind:value={organizer.company}
	/>
	<div class="flex items-end gap-5">
		<select class="max-w-[6rem]" name="" id="">
			{#each countries as country}
				<option value={country.phonecode}>
					{'+'}{country.phonecode}
				</option>
			{/each}
		</select>
		<Input required label="Phone:" type="tel" name="phone" bind:value={organizer.phone} />
		<Input required label="E-mail:" type="email" name="email" bind:value={organizer.email} />
	</div>
	<div class="flex flex-col w-full">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Location:'}
		</span>
		<div class="grid grid-cols-3 gap-y-5 py-5">
			{#each REGIONS as region}
				<label class="flex w-full gap-2">
					<input
						checked={organizerHasRegion(region.id)}
						value={region.id}
						on:click={handleCheck}
						type="checkbox"
					/>
					<span class="text-neutral-4 font-light text-sm tracking-[0.5px]">
						{region.name}
					</span>
				</label>
			{/each}
		</div>
	</div>
	<!-- <Input required label="Country:" type="text" bind:value={organizer.country.name} /> -->
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Country:'}
	</span>
	<Dropdown
		name="countryId"
		selected={{
			value: organizer.countryId ?? 0,
			title: countries[organizer.countryId - 1]?.nicename ?? 'Choose the country organizer'
		}}
		width="100%"
		bind:value={organizer.countryId}
		items={countries.map((country) => {
			return { value: country.id, title: country.nicename ?? '' }
		})}
	/>
	<Input required name="twitter" label="Twitter:" type="text" bind:value={organizer.twitter} />
	<Input required name="website" label="Website:" type="url" bind:value={organizer.website} />
	<Input required name="facebook" label="Facebook:" type="text" bind:value={organizer.facebook} />
	<Input
		required
		name="instagram"
		label="Instagram:"
		type="text"
		bind:value={organizer.instagram}
	/>
	<Input required name="youtube" label="Youtube:" type="text" bind:value={organizer.youtube} />
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Organizer photo'}
	</span>
	{#if addOrganizer}
		<UploadedImage image={addOrganizer.logo?.url ?? ''} />
	{:else}
		<DragAndDrop
			bind:uploaded={organizer.logos}
			url="/api/resources"
			name="file"
			title="Upload your image (Optional)"
			subtitle="PNG, JPG, WEBP, 2MB files are allowed"
			body="1000x1000"
		/>
	{/if}
	<label class="flex flex-col w-full gap-2">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Description:'}
		</span>
		<textarea class="min-h-[150px]" bind:value={organizer.description} />
	</label>
	<div class="flex gap-10">
		<MainButton {loading}>Submit</MainButton>
		<MainButton on:click={onCancel}>cancel</MainButton>
	</div>
</form>

<style lang="scss">
	textarea,
	select {
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
	textarea,
	select::placeholder {
		color: var(--input-placeholder);
	}
	textarea,
	select:active {
		-webkit-box-shadow: 0 0 0 30px var(--input-bg) inset !important;
		box-shadow: 0 0 0 30px var(--input-bg) inset !important;
	}
	textarea,
	select:-webkit-autofill {
		-webkit-text-fill-color: var(--input-text) !important;
	}
</style>
