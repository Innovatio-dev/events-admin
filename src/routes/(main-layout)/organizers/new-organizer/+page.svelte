<script>
	import OrganizerForm from '$lib/components/custom/OrganizerForm.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	const createNewOrganizerRequest = async (organizer) => {
		await postOrganizerRequest(organizer)
	}

	async function postOrganizerRequest(organizer) {
		try {
			const res = await fetch(`${$page.url.origin}/api/organizers`, {
				method: 'POST',
				body: JSON.stringify({ ...organizer })
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
		$pageStatus.title = 'Register a New Organizer'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<OrganizerForm submitAction={createNewOrganizerRequest} />
	</div>
</section>
