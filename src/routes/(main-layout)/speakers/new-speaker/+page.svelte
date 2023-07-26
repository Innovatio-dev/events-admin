<script>
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import SpeakerForm from '$lib/components/custom/SpeakerForm.svelte'

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
				$pageAlert = { message: 'Success! Speaker added correctly.', status: true }
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
	}

	onMount(() => {
		$pageStatus.title = 'Create Speaker'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<SpeakerForm submitAction={createNewSpeaker} />
	</div>
</section>
