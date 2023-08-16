<script lang="ts">
	// Svelte
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import SpeakerForm from '$lib/components/custom/SpeakerForm.svelte'
	// Animations
	import { Circle3 } from 'svelte-loading-spinners'

	let speaker: any = null
	let loading: boolean = true

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

	async function updateSpeaker(id, speaker) {
		loading = true
		try {
			const res = await fetch(`/api/speakers/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...speaker })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Speaker updated correctly.', status: true }
				goto(`/speakers`)
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
		}
		loading = false
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Edit Speaker'
		await fetchSpeaker(id)
	})
</script>

<section class="w-full">
	<div class="flex flex-col items-center justify-center w-full p-6">
		{#if loading}
			<div class="w-full h-[50vh] flex items-center justify-center">
				<Circle3
					ballBottomLeft={'#14dcff'}
					ballBottomRight={'#fd369d'}
					ballTopRight={'#8863e08f'}
					ballTopLeft={'#ffa5d3'}
				/>
			</div>
		{:else if speaker}
			<div class="flex flex-col items-center gap-5">
				<SpeakerForm updateAction={updateSpeaker} addSpeaker={speaker} />
			</div>
		{/if}
	</div>
</section>
