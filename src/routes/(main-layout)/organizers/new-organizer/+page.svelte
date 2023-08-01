<script>
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import OrganizerForm from '$lib/components/custom/OrganizerForm.svelte'

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
				$pageAlert = { message: 'Success! Organizer added correctly.', status: true }
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
			goto('/organizers')
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
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
