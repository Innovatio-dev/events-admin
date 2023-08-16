<script lang="ts">
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '../MainButton.svelte'
	import DragAndDrop from '../DragAndDrop.svelte'
	import UploadedImage from './UploadedImage.svelte'
	import Dropdown from '../Dropdown.svelte'
	import Editor from './Editor.svelte'

	// Constants
	import { countries } from '$lib/utils/constants/Regions'

	interface Speaker {
		id?: number
		picture?: any
		name: string
		company: string
		jobRole: string
		countryId: any
		twitter: string
		facebook: string
		instagram: string
		linkedin: string
		youtube: string
		description: string
		country?: { id: number; nicename: '' }
	}

	// Props
	export let addSpeaker: Speaker | null = null
	export let updateAction: ((id: number, speaker) => Promise<void> | null) | null = null
	export let submitAction = (speaker) => {}

	// State
	let speaker: Speaker = {
		name: '',
		company: '',
		jobRole: '',
		countryId: '',
		twitter: '',
		facebook: '',
		instagram: '',
		linkedin: '',
		youtube: '',
		description: ''
	}
	let updatedSpeaker = {}
	let loading = false

	if (addSpeaker) {
		speaker = JSON.parse(JSON.stringify(addSpeaker))
		speaker.countryId = addSpeaker.country?.id
	}

	const handleSubmit = async () => {
		if (updateAction) {
			loading = true
			await updateAction(speaker?.id ?? 0, updatedSpeaker)
			// console.log(updatedSpeaker)
			loading = false
		} else {
			loading = true
			const formattedData = {
				...speaker,
				twitter: 'https://twitter.com/' + speaker.twitter.replace(/\s/g, '_'),
				facebook: 'https://facebook.com/' + speaker.facebook.replace(/\s/g, '_'),
				instagram: 'https://instagram.com/' + speaker.instagram.replace(/\s/g, '_'),
				linkedin: 'https://linkedin.com/' + speaker.linkedin.replace(/\s/g, '_'),
				youtube: 'https://youtube.com/' + speaker.youtube.replace(/\s/g, '_'),
				pictureId: speaker.picture[0]
			}
			await submitAction(formattedData)
			// console.log(formattedData)
			loading = false
		}
	}

	const updateSpeaker = (e) => {
		updatedSpeaker[e.target.name] = e.target.value
	}

	const customUpdate = (e) => {
		updatedSpeaker[e.detail.name] = e.detail.value
	}

	const onCancel = () => {}
</script>

<form
	on:change={updateSpeaker}
	on:submit|preventDefault={handleSubmit}
	class="flex min-w-[500px] max-w-[650px] flex-col w-full gap-5"
>
	<Input required label="Speaker full name:" type="text" name="name" bind:value={speaker.name} />
	<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
		{'Country'}
	</span>
	<Dropdown
		required
		name="countryId"
		selected={{
			value: speaker.countryId ?? 0,
			title: countries[speaker.countryId - 1]?.nicename ?? 'Choose the country speaker'
		}}
		width="100%"
		bind:value={speaker.countryId}
		items={countries.map((country) => {
			return { value: country.id, title: country.nicename ?? '' }
		})}
	/>
	<Input
		label="Speaker company:"
		required
		type="text"
		name="company"
		bind:value={speaker.company}
	/>
	<Input
		label="Rol / Position"
		required
		type="text"
		name="jobRole"
		bind:value={speaker.jobRole}
	/>
	<div class="flex flex-col w-full gap-2 pb-12">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Description:'}
		</span>
		<!-- <textarea
			required
			class="min-h-[150px]"
			name="description"
			bind:value={speaker.description}
		/> -->
		<Editor on:change={customUpdate} name="description" bind:value={speaker.description} />
	</div>
	<div class="grid grid-cols-2 gap-5">
		<Input label="Twitter:" type="text" name="twitter" bind:value={speaker.twitter} />
		<Input label="Instagram:" type="text" name="instagram" bind:value={speaker.instagram} />
		<Input label="Linkedin:" type="text" name="linkedin" bind:value={speaker.linkedin} />
		<Input label="Facebook:" type="text" name="facebook" bind:value={speaker.facebook} />
	</div>
	<Input label="Youtube:" type="text" name="youtube" bind:value={speaker.youtube} />
	<div class="flex flex-col w-full gap-2">
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{'Speaker photo'}
		</span>
		<div class="text-neutral-4 w-full flex justify-center py-3">
			<h2 class="text-2xl">
				{'Speaker photo'}
			</h2>
		</div>
		{#if addSpeaker}
			<UploadedImage image={addSpeaker.picture?.url ?? ''} />
		{:else}
			<DragAndDrop
				bind:uploaded={speaker.picture}
				url="/api/resources"
				name="file"
				title="Upload your image"
				subtitle="PNG, JPG, WEBP, 2MB files are allowed"
				body="1000x1000"
				multiple={false}
			/>
		{/if}
	</div>
	<div class="flex gap-10">
		<MainButton {loading}>Save</MainButton>
		<MainButton on:click={onCancel}>cancel</MainButton>
	</div>
</form>
