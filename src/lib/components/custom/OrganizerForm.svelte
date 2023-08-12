<script lang="ts">
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '../MainButton.svelte'
	import ToggleButtton from '../ToggleButtton.svelte'
	import DragAndDrop from '../DragAndDrop.svelte'
	import UploadedImage from './UploadedImage.svelte'
	import Dropdown from '../Dropdown.svelte'
	import LadaViewer from './data_viewer/LadaViewer.svelte'

	// Constants
	import { countries, REGIONS } from '$lib/utils/constants/Regions'

	interface Organizer {
		id?: number
		logo?: any
		status?: number
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
	}

	// Props
	export let addOrganizer: Organizer | null = null
	export let updateAction: ((id: number, speaker) => Promise<void> | null) | null = null
	export let submitAction = (organizer) => {}

	// State
	let organizer: Organizer = {
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
		logo: null
	}
	let isMember = false
	let phoneCode = '705'

	let updatedOrganizer = {
		status: addOrganizer?.status,
		reason: 'Organizer updated'
	}
	let loading = false

	if (addOrganizer) {
		organizer = JSON.parse(JSON.stringify(addOrganizer))
		organizer.countryId = addOrganizer.country?.id
		if (addOrganizer.mavieId && Number(addOrganizer.mavieId) >= 0) {
			isMember = true
		}
	}

	const handleSubmit = async () => {
		if (updateAction) {
			loading = true
			await updateAction(organizer?.id ?? 0, updatedOrganizer)
			loading = false
		} else {
			loading = true
			const formattedData = {
				...organizer,
				phone: phoneCode + organizer.phone,
				twitter: 'https://twitter.com/' + organizer.twitter.replace(/\s/g, '_'),
				facebook: 'https://facebook.com/' + organizer.facebook.replace(/\s/g, '_'),
				instagram: 'https://instagram.com/' + organizer.instagram.replace(/\s/g, '_'),
				youtube: 'https://youtube.com/' + organizer.youtube.replace(/\s/g, '_'),
				logoId: organizer.logo[0]
			}
			await submitAction(formattedData)
			// console.log(formattedData)
			loading = false
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
			<ToggleButtton bind:checked={isMember} id="tid1" text right="Yes" left="No" />
		</div>
		<div>
			<Input
				required={isMember}
				label="Mavie Id:"
				type="number"
				name="mavieId"
				bind:value={organizer.mavieId}
			/>
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
		label="Organizer company name (optional):"
		type="text"
		name="company"
		bind:value={organizer.company}
	/>
	<div class="flex items-end gap-5">
		<Dropdown
		width='8rem'
			itemViewer={LadaViewer}
			bind:value={phoneCode}
			itemGenerator={(item) => ({ title: item.title, iso: item.iso })}
			items={countries.map((country) => {
				return {
					value: country.phonecode,
					title: '+' + country.phonecode,
					iso: country.iso
				}
			})}
			selected={{ title: '+' + phoneCode, value: phoneCode }}
		/>
		<Input required label="Phone:" type="tel" name="phone" bind:value={organizer.phone} />
		<Input required label="E-mail:" type="email" name="email" bind:value={organizer.email} />
	</div>
	<div class="flex flex-col w-full">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Where would you be interested in organizing events?'}
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
	<!-- <Input required label="Where are you from?" type="text" bind:value={organizer.country.name} /> -->
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Where are you from?'}
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
	<Input name="twitter" label="Twitter (optional):" type="text" bind:value={organizer.twitter} />
	<Input name="website" label="Website (optional):" type="url" bind:value={organizer.website} />
	<Input
		name="facebook"
		label="Facebook (optional):"
		type="text"
		bind:value={organizer.facebook}
	/>
	<Input
		name="instagram"
		label="Instagram (optional):"
		type="text"
		bind:value={organizer.instagram}
	/>
	<Input name="youtube" label="Youtube (optional):" type="text" bind:value={organizer.youtube} />
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Organizer photo (optional)'}
	</span>
	{#if addOrganizer}
		<UploadedImage image={addOrganizer.logo?.url ?? ''} />
	{:else}
		<DragAndDrop
			bind:uploaded={organizer.logo}
			url="/api/resources"
			name="file"
			title="Upload your image"
			subtitle="PNG, JPG, WEBP, 2MB files are allowed"
			body="1000x1000"
			multiple={false}
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
