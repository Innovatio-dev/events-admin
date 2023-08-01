<script lang="ts">
	// Common
	import { afterNavigate, goto } from '$app/navigation'
	import { page } from '$app/stores'
	// Components
	import Dropdown from '$lib/components/Dropdown.svelte'
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Board from '$lib/components/icons/Board.svelte'
	import Ticket from '$lib/components/icons/Ticket.svelte'
	import Badge from '$lib/components/Badge.svelte'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import EmptyResults from '$lib/components/EmptyResults.svelte'
	// Utils
	import { organizerListSchema } from '$lib/utils/validation/schemas'
	import { createDebouncer } from '$lib/utils/debounce'
	import {
		createUrl,
		mapArrayIntoCollection,
		mapArrayIntoCollectionOrder,
		validateUrlSearchParams
	} from '$lib/utils/validation/validation'
	// Icons
	import Icon from 'svelte-icons-pack'
	import AiOutlineCloudDownload from 'svelte-icons-pack/ai/AiOutlineCloudDownload'
	import AiOutlineSearch from 'svelte-icons-pack/ai/AiOutlineSearch'
	// Constants
	import { OrganizerRequestColumns } from '$lib/utils/constants/ListTables'
	import ExportCsvButton from '$lib/components/custom/ExportCSVButton.svelte'

	// State
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

	let searchDebouncer = createDebouncer(() => {
		gotoFilter({
			search: params.search != '' ? params.search : null,
			page: 1
		})
	}, 400)

	const statuses = [
		{ value: 0, title: 'Pending', variant: 'primary' },
		{ value: 1, title: 'Approved', variant: 'success' },
		{ value: 2, title: 'Denied', variant: 'error' }
	]

	const types = [
		{ value: 0, title: 'Live Events', variant: 'secondary' },
		{ value: 1, title: 'Virtual', variant: 'secondary' }
	]

	afterNavigate(async () => {
		try {
			params = validateUrlSearchParams($page.url.searchParams, organizerListSchema)
			if (params.status.length) {
				params.status = mapArrayIntoCollection(params.status, statuses, 'value')
			}
			if (params.typeEvent.length) {
				params.typeEvent = mapArrayIntoCollection(params.typeEvent, types, 'value')
			}
			if (params.order.length) {
				params.order = mapArrayIntoCollectionOrder(params.order, OrganizerRequestColumns)
			} else {
				params.order = [{ column: OrganizerRequestColumns[1], index: 1, type: 'desc' }]
			}
		} catch (error) {}
		await fetchOrganizersRequests()
	})

	async function fetchOrganizersRequests() {
		loading = true
		const url = new URL('/api/organizersRequests', window.location.origin)
		const cUrl = createUrl(url, {
			status: params.status.map((status) => status.value),
			typeEvent: params.typeEvent.map((type) => type.value),
			order: params.order.map(
				(sortedCol) => `${sortedCol.type == 'asc' ? '' : '-'}${sortedCol.column.dataKey}`
			),
			search: params.search,
			offset: (params.page - 1) * itemsPerPage,
			limit: itemsPerPage
		})

		const response = await fetch(cUrl)
		if (response.ok) {
			data = await response.json()
			if (data.results) {
				data.results = data.results.map((item) => ({
					...item,
					link: `/organizer-requests/${item.id}`
				}))
				pageCount = Math.ceil(data.count / itemsPerPage)
			}
		} else {
			error = await response.json()
		}
		loading = false
	}

	async function gotoFilter(filter: any) {
		const url = createUrl($page.url, filter)

		await goto(url, {
			replaceState: true,
			keepFocus: true
		})
	}

	function onPageChange(event) {
		let page = event.detail
		gotoFilter({
			page
		})
	}

	function onSearchChange(event) {
		searchDebouncer.debounce()
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

	function onSearchKeypress(event) {
		const originalEvent = event.detail
		if (originalEvent.code == 'Enter') {
			searchDebouncer.cancel()
			gotoFilter({
				search: params.search,
				page: 1
			})
		}
	}
</script>

<svelte:head>
	<title>Organizer</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col w-full px-4">
	<div class="flex justify-between pt-12">
		<div>
			<h2>Organizer Request</h2>
		</div>
		<div class="flex gap-x-4 max-h-12 z-50">
			<Input
				placeholder="Search"
				on:keypress={onSearchKeypress}
				on:change={onSearchChange}
				bind:value={params.search}
			>
				<Icon slot="trailing" src={AiOutlineSearch} color="currentColor" />
			</Input>
			<Dropdown
				width="200px"
				items={statuses}
				bind:selected={params.status}
				multiselect
				on:change={(event) => {
					const selected = event.detail.selected
					const values = selected.map((status) => status.value)
					gotoFilter({
						status: values
					})
				}}
			>
				<span slot="title">Status</span>
				<div class="text-xl" slot="leading">
					<Board />
				</div>
			</Dropdown>
			<Dropdown
				items={types}
				bind:selected={params.typeEvent}
				multiselect
				on:change={(event) => {
					const selected = event.detail.selected
					const values = selected.map((type) => type.value)
					gotoFilter({
						typeEvent: values
					})
				}}
			>
				<span slot="title">Type Event</span>
				<div class="text-xl" slot="leading">
					<Ticket />
				</div>
			</Dropdown>
			<ExportCsvButton urlPrefix="organizersRequests" />
		</div>
	</div>
	<div class="w-full flex py-10 gap-4">
		<div class="flex-grow flex gap-4 flex-row-reverse flex-wrap">
			{#each params.typeEvent as type, index}
				<Badge
					hideOnClose={false}
					type={type.variant}
					onClose={() => {
						params.typeEvent.splice(index, 1)
						gotoFilter({
							page: 1,
							typeEvent: params.typeEvent.map((type) => type.value)
						})
					}}>{type.title}</Badge
				>
			{/each}
			{#each params.status as status, index}
				<Badge
					hideOnClose={false}
					type={status.variant}
					onClose={() => {
						params.status.splice(index, 1)
						gotoFilter({
							page: 1,
							status: params.status.map((status) => status.value)
						})
					}}>{status.title}</Badge
				>
			{/each}
		</div>
	</div>
	{#if !error}
		<SortableTable
			bind:currentPage={params.page}
			on:pageChange={onPageChange}
			on:sortChange={onSortChange}
			columns={OrganizerRequestColumns}
			data={data?.results}
			maxItemsPerPage={itemsPerPage}
			sortedColumns={params.order}
			{loading}
			{pageCount}
		/>
	{/if}
	{#if !loading && !data?.results.length}
		<EmptyResults />
	{/if}
</section>

<style>
</style>
