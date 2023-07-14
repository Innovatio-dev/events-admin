<script lang="ts">
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '../MainButton.svelte'
	import ToggleButtton from '../ToggleButtton.svelte'
	import DragAndDrop from '../DragAndDrop.svelte'
	import UploadedImage from './UploadedImage.svelte'

	// Constants
	import { countries, REGIONS } from '$lib/utils/constants/Regions'

	interface Organizer {
		logo?: any
		isMember: boolean
		mavieId: string
		name: string
		company: string
		phone: string
		email: string
		regions: any[]
		country: any
		twitter: string
		website: string
		facebook: string
		instagram: string
		youtube: string
		description: string
	}

	// Props
	export let addOrganizer: Organizer | null = null
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
		country: {},
		twitter: '',
		website: '',
		facebook: '',
		instagram: '',
		youtube: '',
		description: ''
	}

	if (addOrganizer) {
		organizer.isMember = addOrganizer.isMember
		organizer.mavieId = addOrganizer.mavieId
		organizer.name = addOrganizer.name
		organizer.company = addOrganizer.company
		organizer.phone = addOrganizer.phone
		organizer.email = addOrganizer.email
		organizer.regions = addOrganizer.regions
		organizer.country = addOrganizer.country
		organizer.twitter = addOrganizer.twitter
		organizer.website = addOrganizer.website
		organizer.facebook = addOrganizer.facebook
		organizer.instagram = addOrganizer.instagram
		organizer.youtube = addOrganizer.youtube
		organizer.description = addOrganizer.description
	}

	export function handleSubmit() {
		const socialsUris = {
			twitter: 'https://twitter.com/' + organizer.twitter.replace(/\s/g, '_'),
			facebook: 'https://facebook.com/' + organizer.facebook.replace(/\s/g, '_'),
			instagram: 'https://instagram.com/' + organizer.instagram.replace(/\s/g, '_'),
			youtube: 'https://youtube.com/' + organizer.youtube.replace(/\s/g, '_')
		}
		submitAction({ ...organizer, ...socialsUris })
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
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col w-full gap-5">
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
			<Input required label="Mavie Id:" type="number" bind:value={organizer.mavieId} />
		</div>
	</div>
	<Input required label="Organizer full name:" type="text" bind:value={organizer.name} />
	<Input required label="Organizer company name:" type="text" bind:value={organizer.company} />
	<div class="flex items-end gap-5">
		<select class="max-w-[6rem]" name="" id="">
			{#each countries as country}
				<option value={country.phonecode}>
					{'+'}{country.phonecode}
				</option>
			{/each}
		</select>
		<Input required label="Phone:" type="tel" bind:value={organizer.phone} />
		<Input required label="E-mail:" type="email" bind:value={organizer.email} />
	</div>
	<div class="flex flex-col w-full">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Location:'}
		</span>
		<div class="grid grid-cols-3 gap-y-5 py-5">
			{#each REGIONS as region}
				<label class="flex w-full gap-2">
					<input
						required
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
	<Input required label="Country:" type="text" bind:value={organizer.country.name} />
	<Input required label="Twitter:" type="text" bind:value={organizer.twitter} />
	<Input required label="Website:" type="url" bind:value={organizer.website} />
	<Input required label="Facebook:" type="text" bind:value={organizer.facebook} />
	<Input required label="Instagram:" type="text" bind:value={organizer.instagram} />
	<Input required label="Youtube:" type="text" bind:value={organizer.youtube} />
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Organizer photo'}
	</span>
	{#if addOrganizer}
		<UploadedImage image={addOrganizer.logo.url} />
	{:else}
		<DragAndDrop
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
		<MainButton>Submit</MainButton>
		<MainButton>cancel</MainButton>
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
		// &.error {
		// 	border: 2px solid var(--input-text-error);
		// 	background-color: var(--input-bg-error);
		// 	color: var(--input-text-error);
		// }
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
	// .actions {
	// 	position: absolute;
	// 	height: 100%;
	// 	display: flex;
	// 	align-items: center;
	// 	justify-content: center;
	// 	gap: 10px;
	// 	top: 0;
	// 	right: 0;
	// 	padding: 0.7rem calc(0.6rem * 20 / 12);
	// 	color: var(--input-placeholder);
	// 	transition: color 0.3s ease-in-out;
	// 	&.focused {
	// 		color: var(--input-text);
	// 	}
	// 	&.error {
	// 		color: var(--input-text-error);
	// 	}
	// 	.icon {
	// 		cursor: pointer;
	// 		font-size: 22px;
	// 	}
	// }
</style>
