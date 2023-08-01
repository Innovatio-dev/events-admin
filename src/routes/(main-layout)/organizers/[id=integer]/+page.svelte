<script lang="ts">
	// Svelte
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	// Store
	import { pageAlert, pageStatus } from '$lib/stores/pageStatus'
	// Components
	import MainButton from '$lib/components/MainButton.svelte'
	import SecondaryButton from '$lib/components/SecondaryButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import SuspendOrganizer from '$lib/components/SuspendOrganizer.svelte'
	import OrganizerView from '$lib/components/custom/OrganizerView.svelte'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'

	// State
	let organizer: any = null
	let events = []
	let loading: boolean = true

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}

	// Confirmation Modal
	let isOpenConfirmation = false
	const handleOpenConfirmationModal = () => {
		isOpenConfirmation = true
	}
	const handleCloseConfirmationModal = () => {
		isOpenConfirmation = false
	}

	const options = [
		{ id: 'option1', label: 'User is not eligible for our events..' },
		{ id: 'option2', label: 'There are missing some more information about you.' }
	]

	const fetchOrganizer = async (id) => {
		loading = true
		let response = await fetch(`/api/organizers/${id}`)
		if (response.ok) {
			organizer = await response.json()
			// console.log(organizer)
			$pageStatus.title = organizer.name
		}
		loading = false
	}

	const fetchOrganizerEvents = async (id) => {
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

	const suspendOrganizer = async (id, suspendReason, action = 1) => {
		try {
			const res = await fetch(`/api/organizers/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ status: action, reason: suspendReason })
			})
			if (res.ok) {
				const data = await res.json()
				// console.log(data)
				$pageAlert = {
					message: action ? 'Organizer suspended.' : "Organizer's suspension removed.",
					status: true
				}
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

	const handleSuspend = async (e) => {
		await suspendOrganizer(organizer.id, e.detail.reason)
	}
	const handleUnsuspend = async () => {
		await suspendOrganizer(organizer.id, 'empty', 0)
	}

	onMount(async () => {
		let id = $page.params.id
		await fetchOrganizer(id)
		await fetchOrganizerEvents(id)
	})
</script>

<div class="w-full p-6">
	<OrganizerView {organizer} {loading} />
	{#if organizer?.status === 0}
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
				<Modal {isOpen} handleClose={handleCloseModal} title="">
					<SuspendOrganizer
						on:submit={handleSuspend}
						{events}
						items={options}
						handleClose={handleCloseModal}
					/>
				</Modal>
			</div>
		</div>
	{:else if organizer?.status === 1}
		<div class="w-fit">
			<SecondaryButton on:click={handleOpenConfirmationModal}>
				<div class="flex gap-5">
					{'Revoque Suspension'}
				</div>
			</SecondaryButton>
		</div>
		<Modal isOpen={isOpenConfirmation} handleClose={handleCloseConfirmationModal}>
			<ApprovedModal
				text="Are you sure you would like to revoke suspension for this User?"
				onConfirm={handleUnsuspend}
				onCancel={handleCloseConfirmationModal}
			/>
		</Modal>
	{/if}
</div>
