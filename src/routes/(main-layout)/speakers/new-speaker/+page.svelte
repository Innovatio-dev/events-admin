<script>
	import SpeakerForm from '$lib/components/custom/SpeakerForm.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	const createNewSpeaker = async (speaker) => {
		await postSpeaker(speaker)
	}

	async function postSpeaker(speaker) {
		try {
			const res = await fetch(`${$page.url.origin}/api/speakers`, {
				method: 'POST',
				body: JSON.stringify({ ...speaker })
			})

			if (res.ok) {
				const data = await res.json()
				console.log(data)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
	}

	onMount(() => {
		$pageStatus.title = 'Create Speaker'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<SpeakerForm submitAction={createNewSpeaker}/>
	</div>
</section>
