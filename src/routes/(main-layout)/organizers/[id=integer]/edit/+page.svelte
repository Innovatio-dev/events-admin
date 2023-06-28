<script lang="ts">
	import { page } from '$app/stores'
	import BreadCrumb from '$lib/components/BreadCrumb.svelte'
	import OrganizerForm from '$lib/components/custom/OrganizerForm.svelte'
	import ProfileHeader from '$lib/components/custom/ProfileHeader.svelte'
	import { onMount } from 'svelte'
	import { Circle3 } from 'svelte-loading-spinners'
	let organizer: any = null
	let loading: boolean = true
	onMount(async () => {
		let id = $page.params.id
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
</script>

<section class="w-full">
	<div class="flex flex-col items-center justify-center w-full p-6">
		{#if loading}
			<div class="w-full h-[50vh] flex items-center justify-center">
				<Circle3 />
			</div>
		{:else if organizer}
			<div class="flex flex-col items-center gap-5">
				<ProfileHeader
					img={organizer.logo.url}
					organizerId={organizer.uid}
					requestDate={new Date(organizer.createdAt)}
					aproveDate={new Date(organizer.createdAt)}
				/>
				<div class="w-full border-t border-neutral-4" />
				<OrganizerForm addOrganizer={organizer} />
			</div>
		{/if}
	</div>
</section>
