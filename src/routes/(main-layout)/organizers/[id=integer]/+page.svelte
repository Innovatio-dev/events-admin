<script lang="ts">
	import MainButton from '$lib/components/MainButton.svelte'
	import SecondaryButton from '$lib/components/SecondaryButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import SuspendOrganizer from '$lib/components/SuspendOrganizer.svelte'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { Circle3 } from 'svelte-loading-spinners'
	import OrganizerView from '$lib/components/custom/OrganizerView.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}
	const options = [
		{ id: 'option1', label: 'User is not eligible for our events..' },
		{ id: 'option2', label: 'There are missing some more information about you.' }
	]

	let organizer: any = null
	let events = []
	let loading: boolean = true

	onMount(async () => {
		let id = $page.params.id
		await fetchOrganizer(id)
		await fetchOrganizerEvents(id)
	})

	async function fetchOrganizer(id) {
		loading = true
		let response = await fetch(`/api/organizers/${id}`)
		if (response.ok) {
			organizer = await response.json()
			// console.log(organizer)
			$pageStatus.title = organizer.name
		}
		loading = false
	}

	async function fetchOrganizerEvents(id) {
		loading = true
		let response = await fetch(`/api/events?organizerId=${id}`)
		if (response.ok) {
			let data = await response.json()
			events = data.results.map((event) => {
				let fullString = event.uid + ' ' + event.title
				return fullString
			})
		}
		loading = false
	}
</script>

<div class="w-full p-6">
	<OrganizerView {organizer} {loading} />
	<div class="flex flex-row gap-6">
		<div class="w-fit">
			<MainButton href={`/organizers/${$page.params.id}/edit`}>
				{'Edit'}
			</MainButton>
		</div>
		<div class="w-fit">
			<SecondaryButton on:click={handleOpenModal}>
				{'Suspend'}
			</SecondaryButton>
			<svelte:component this={Modal} {isOpen} handleClose={handleCloseModal} title="">
				<SuspendOrganizer {events} items={options} handleClose={handleCloseModal} />
			</svelte:component>
		</div>
	</div>
</div>
