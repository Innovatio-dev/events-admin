<script lang="ts">
	// Common
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	// Store
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	// Components
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import OrganizerView from '$lib/components/custom/OrganizerView.svelte'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'
	import OrganizerAplication from '$lib/components/custom/OrganizerAplication.svelte'
	import SuspensionData from '$lib/components/custom/SuspensionData.svelte'
	// Icons
	import VscClose from 'svelte-icons-pack/vsc/VscClose'
	import BsCheck2 from 'svelte-icons-pack/bs/BsCheck2'
	import Icon from 'svelte-icons-pack/Icon.svelte'

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
	const options = [{ id: 'option1', label: 'There is some missing information about you.' }]
	let organizer: any = null
	let loading: boolean = true
	let fetchLoading = false
	let logData: any = null

	const setDenied = async () => {
		fetchLoading = true
		let reason = ''

		if (selectedLabel.length) {
			reason = selectedLabel
		} else {
			let day = new Date(Date.now())
			reason = options[0].label
		}
		try {
			const res = await fetch(`${$page.url.origin}/api/organizersRequests/${organizer.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					status: 2,
					reason: reason
				})
			})
			if (res.ok) {
				const data = await res.json()
				// console.log(data)
				$pageAlert = { message: 'Organizer request dennied', status: true }
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
			fetchLoading = false
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = {
				message: 'Oops! An error has occurred. try again later.',
				status: false
			}
		}
	}

	const setApproved = async () => {
		fetchLoading = true
		let day = new Date(Date.now())
		try {
			const res = await fetch(`${$page.url.origin}/api/organizersRequests/${organizer.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					status: 1,
					reason: `Approved in ${day}`
				})
			})
			if (res.ok) {
				const data = await res.json()
				// console.log(data)
				$pageAlert = { message: 'Organizer request approved', status: true }
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
			fetchLoading = false
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = {
				message: 'Oops! An error has occurred. try again later.',
				status: false
			}
		}
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
			// console.log(organizer)
			$pageStatus.status = organizer.status
		}
		loading = false
	}

	const fetchDeniedData = async (id) => {
		loading = true
		let response = await fetch(`/api/organizersRequests/${id}/logs`)
		if (response.ok) {
			const data = await response.json()
			logData = data.requests
			// console.log(logData)
		}
		loading = false
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Organizer Aplication'
		await fetchOrganizerRequest(id)
		await fetchDeniedData(id)
	})
</script>

<div class="w-full">
	<div class="w-[95%] mx-auto gap-x-12">
		<OrganizerView {organizer} {loading} />
	</div>
	<div class="flex flex-row w-[95%] gap-x-6 py-6">
		<div class="flex flex-row w-[95%] mx-auto gap-x-6 py-6">
			{#if organizer?.status === 0}
				<div class="w-fit">
					<MainButton on:click={handleOpenModalApproved}>
						<div class="flex gap-3 items-center">
							<Icon size="20" src={BsCheck2} />
							{'Approve'}
						</div>
					</MainButton>
					<Modal isOpen={isOpenApproved} handleClose={handleCloseModalApproved} title="">
						<ApprovedModal
							onCancel={handleCloseModalApproved}
							onConfirm={handleAprovedModal}
							isLoading={fetchLoading}
						/>
					</Modal>
				</div>
				<div class="w-fit">
					<MainButton on:click={handleOpenModalDenied}>
						<div class="flex gap-3 items-center">
							<Icon size="20" src={VscClose} />
							{'Deny'}
						</div>
					</MainButton>
					<Modal isOpen={isOpenDenied} handleClose={handleCloseModalDennied} title="">
						<OrganizerAplication
							handleClose={handleCloseModalDennied}
							handleOnSubmit={handleDeniedModal}
							items={options}
							bind:selectedLabel
							loading={fetchLoading}
						/>
					</Modal>
				</div>
			{:else if organizer?.status === 2}
				<SuspensionData title='Dennied' {loading} {logData} />
			{/if}
		</div>
	</div>
</div>
