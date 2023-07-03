<script lang="ts">
	// Common
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	// Components
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import OrganizerView from '$lib/components/custom/OrganizerView.svelte'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'
	import OrganizerAplication from '$lib/components/custom/OrganizerAplication.svelte'
	// Icons
	import VscClose from 'svelte-icons-pack/vsc/VscClose'
	import BsCheck2 from 'svelte-icons-pack/bs/BsCheck2'
	import Icon from 'svelte-icons-pack/Icon.svelte'
	// Context
	import { pageStatus } from '$lib/stores/pageStatus'

	// Modal Approved
	let isOpenApproved = false

	const handleOpenModalApproved = () => {
		isOpenApproved = true
	}

	const handleCloseModalApproved = () => {
		isOpenApproved = false
	}

	// Modal Denied
	let isOpenDenied = false

	const handleOpenModalDenied = () => {
		isOpenDenied = true
	}

	const handleCloseModalDennied = () => {
		isOpenDenied = false
	}

	// State
	let selectedLabel = ''
	const options = [{ id: 'option1', label: 'Deny application option.' }]
	let organizer: any = null
	let loading: boolean = true

	const setDenied = async () => {
		let reason = ''

		if (selectedLabel.length) {
			reason = selectedLabel
		} else {
			let day = new Date(Date.now())
			reason = options[0].label
		}

		const res = await fetch(`${$page.url.origin}/api/organizersRequests/${organizer.id}`, {
			method: 'PUT',
			body: JSON.stringify({
				status: 2,
				reason: reason
			})
		})
	}

	const setApproved = async () => {
		let day = new Date(Date.now())

		const res = await fetch(`${$page.url.origin}/api/organizersRequests/${organizer.id}`, {
			method: 'PUT',
			body: JSON.stringify({
				status: 1,
				reason: `Approved in ${day}`
			})
		})
	}

	const handleDeniedModal = async () => {
		await setDenied()
		isOpenDenied = false
		goto('/organizer-requests')
	}

	const handleAprovedModal = async () => {
		await setApproved()
		isOpenApproved = false
		goto('/organizer-requests')
	}

	async function fetchOrganizerRequest(id) {
		loading = true
		let response = await fetch(`/api/organizersRequests/${id}`)
		if (response.ok) {
			organizer = await response.json()
			$pageStatus.status = organizer.status
		}
		loading = false
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Organizer Aplication'
		await fetchOrganizerRequest(id)
	})
</script>

<div class="w-full">
	<div class="w-[95%] mx-auto gap-x-12">
		<OrganizerView {organizer} {loading} />
	</div>
	<div class="flex flex-row w-[95%] gap-x-6 py-6">
		{#if organizer?.status === 0}
			<div class="flex flex-row w-[95%] mx-auto gap-x-6 py-6">
				<div class="w-fit">
					<MainButton on:click={handleOpenModalApproved}>
						<div class="flex gap-3 items-center">
							<Icon size="20" src={BsCheck2} color="gray" />
							{'Approve'}
						</div>
					</MainButton>
					<Modal isOpen={isOpenApproved} handleClose={handleCloseModalApproved} title="">
						<ApprovedModal
							onCancel={handleCloseModalApproved}
							onConfirm={handleAprovedModal}
						/>
					</Modal>
				</div>
				<div class="w-fit">
					<MainButton on:click={handleOpenModalDenied}>
						<div class="flex gap-3 items-center">
							<Icon size="20" src={VscClose} color="gray" />
							{'Deny'}
						</div>
					</MainButton>
					<svelte:component
						this={Modal}
						isOpen={isOpenDenied}
						handleClose={handleCloseModalDennied}
						title=""
					>
						<OrganizerAplication
							handleClose={handleCloseModalDennied}
							handleOnSubmit={handleDeniedModal}
							items={options}
							bind:selectedLabel
						/>
					</svelte:component>
				</div>
			</div>
		{/if}
	</div>
</div>
