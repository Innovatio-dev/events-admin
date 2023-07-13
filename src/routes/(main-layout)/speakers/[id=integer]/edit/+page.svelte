<script lang="ts">
	// Svelte
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	// Components
	import SpeakerForm from '$lib/components/custom/SpeakerForm.svelte'
	import ProfileHeader from '$lib/components/custom/ProfileHeader.svelte'
	import { Circle3 } from 'svelte-loading-spinners'

	let speaker: any = null
	let loading: boolean = true

	onMount(async () => {
		let id = $page.params.id
		await fetchSpeaker(id)
	})

	async function fetchSpeaker(id) {
		loading = true
		try {
			const res = await fetch(`/api/speakers/${id}`)
			if (res.ok) {
				speaker = await res.json()
				// console.log(speaker)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
	}
</script>

<section class="w-full">
	<div class="flex flex-col items-center justify-center w-full p-6">
		{#if loading}
			<div class="w-full h-[50vh] flex items-center justify-center">
				<Circle3 />
			</div>
		{:else if speaker}
			<div class="flex flex-col items-center gap-5">
				<SpeakerForm addSpeaker={speaker} />
			</div>
		{/if}
	</div>
</section>
