<script lang="ts">
	// Svelte
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import OrganizerForm from '$lib/components/custom/OrganizerForm.svelte'
	import ProfileHeader from '$lib/components/custom/ProfileHeader.svelte'
	// Annimations
	import { Circle3 } from 'svelte-loading-spinners'
	import { goto } from '$app/navigation'

	// State
	let organizer: any = null
	let loading: boolean = true

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Edit Organizer'
		await fetchOrganizer(id)
	})

	async function fetchOrganizer(id) {
		loading = true
		let response = await fetch(`/api/organizers/${id}`)
		if (response.ok) {
			organizer = await response.json()
		}

		loading = false
	}

	async function updateOrganizer(id, organizer) {
		loading = true
		try {
			const res = await fetch(`/api/organizers/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...organizer })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Organizer updated correctly.', status: true }
				goto('/organizers')
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
		{:else if organizer}
			<div class="flex flex-col items-center gap-5">
				<ProfileHeader
					img={organizer.logo?.url}
					organizerId={organizer.uid}
					requestDate={new Date(organizer.createdAt)}
					aproveDate={new Date(organizer.createdAt)}
				/>
				<div class="w-full border-t border-neutral-4" />
				<OrganizerForm updateAction={updateOrganizer} addOrganizer={organizer} />
			</div>
		{/if}
	</div>
</section>
