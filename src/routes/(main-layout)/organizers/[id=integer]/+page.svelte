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
	import type { Column } from '$lib/components/SortableTable.svelte'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import DateViewer from '$lib/components/table_cell/DateViewer.svelte'
	import TypeEventViewer from '$lib/components/table_cell/TypeEventViewer.svelte'
	import StatusViewer from '$lib/components/table_cell/StatusViewer.svelte'
	import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'
	import TextViewer from '$lib/components/table_cell/TextViewer.svelte'
	import VRegionViewer from '$lib/components/table_cell/VRegionViewer.svelte'
	import VCountryViewer from '$lib/components/table_cell/VCountryViewer.svelte'
	import VCityViewer from '$lib/components/table_cell/VCityViewer.svelte'
	import FeaturedViewer from '$lib/components/table_cell/FeaturedViewer.svelte'
	// Utils
	import { createUrl } from '$lib/utils/validation/validation'

	// State
	let organizer: any = null
	let events = []
	let loading: boolean = true

	let data: any = null
	let error: any = null
	let itemsPerPage = 15
	let pageCount = 0
	let params: any = {
		typeEvent: [],
		status: [],
		order: [],
		search: null,
		page: 1
	}

	let tableColumns: Column[] = [
		{
			title: 'ID',
			sortable: true,
			dataKey: 'uid',
			minWidth: '8em',
			grow: '0'
		},
		{
			title: 'Title event',
			sortable: false,
			dataKey: 'title',
			minWidth: '8em',
			cellComponent: TextViewer
		},
		{
			title: 'Date',
			sortable: true,
			dataKey: 'createdAt',
			grow: '0',
			minWidth: '11em',
			cellComponent: DateViewer
		},
		{
			title: 'Location',
			sortable: false,
			dataKey: 'venue',
			cellComponent: VRegionViewer
		},
		{
			title: 'Country',
			sortable: true,
			dataKey: 'venue',
			cellComponent: VCountryViewer
		},
		{
			title: 'City',
			sortable: false,
			dataKey: 'venue',
			cellComponent: VCityViewer
		},
		{
			title: 'Type',
			sortable: true,
			dataKey: '',
			minWidth: '12em',
			grow: '0',
			cellComponent: TypeEventViewer
		},
		{
			title: 'R / F',
			sortable: true,
			dataKey: 'isFeatured',
			cellComponent: FeaturedViewer
		},
		{
			title: 'Status',
			sortable: false,
			dataKey: 'status',
			grow: '0',
			minWidth: '5em',
			cellComponent: StatusViewer
		},
		{
			title: 'Details',
			sortable: false,
			cellComponent: SeeMoreButton,
			minWidth: '8em',
			grow: '0',
			dataKey: 'link'
		}
	]
	async function gotoFilter(filter: any) {
		const url = createUrl($page.url, filter)
		await goto(url, {
			replaceState: true,
			keepFocus: true
		})
	}

	function onPageChange(event) {
		let page = event.detail
		// gotoFilter({
		// 	page
		// })
	}
	function onSortChange(event) {
		params.order = event.detail
		const sortOrder = params.order.map((sortedCol) => {
			const sign = sortedCol.type == 'asc' ? '' : '-'
			return `${sign}${sortedCol.column.dataKey}`
		})
		gotoFilter({
			order: sortOrder,
			page: 1
		})
	}

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
			data = await response.json()
			events = data.results.map((event) => {
				let fullString = event.uid + ' ' + event.title
				return fullString
			})
			if (data.results) {
				data.results = data.results.map((item) => ({
					...item,
					link: `/events/${item.id}`
				}))
				pageCount = Math.ceil(data.count / itemsPerPage)
			}
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

<div class="w-full flex flex-col gap-10 p-6">
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
	{#if data?.results.length}
		<SortableTable
			bind:currentPage={params.page}
			on:pageChange={onPageChange}
			on:sortChange={onSortChange}
			columns={tableColumns}
			data={data?.results}
			maxItemsPerPage={itemsPerPage}
			sortedColumns={params.order}
			{loading}
			{pageCount}
		/>
	{/if}
</div>
