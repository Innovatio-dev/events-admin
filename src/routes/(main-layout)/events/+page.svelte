<script lang="ts">
	//Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import TextViewer from '$lib/components/table_cell/TextViewer.svelte'
	import VRegionViewer from '$lib/components/table_cell/VRegionViewer.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
	import VCityViewer from '$lib/components/table_cell/VCityViewer.svelte'
	import FeaturedViewer from '$lib/components/table_cell/FeaturedViewer.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import Badge from '$lib/components/Badge.svelte'
	import type { Column } from '$lib/components/SortableTable.svelte'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import DateViewer from '$lib/components/table_cell/DateViewer.svelte'
	import TypeEventViewer from '$lib/components/table_cell/TypeEventViewer.svelte'
	import EventStatusViewer from '$lib/components/table_cell/EventStatusViewer.svelte'
	import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'
	import ExportCsvButton from '$lib/components/custom/ExportCSVButton.svelte'
	//Icons
	import Icon from 'svelte-icons-pack'
	import AiOutlineCloudDownload from 'svelte-icons-pack/ai/AiOutlineCloudDownload'
	import AiOutlineSearch from 'svelte-icons-pack/ai/AiOutlineSearch'
	import Board from '$lib/components/icons/Board.svelte'
	import Ticket from '$lib/components/icons/Ticket.svelte'
	//Utils
	import { page } from '$app/stores'
	import { createDebouncer } from '$lib/utils/debounce'
	import { afterNavigate, goto } from '$app/navigation'
	import { organizerListSchema } from '$lib/utils/validation/schemas'
	import {
		createUrl,
		mapArrayIntoCollection,
		mapArrayIntoCollectionOrder,
		validateUrlSearchParams
	} from '$lib/utils/validation/validation'
	import EmptyResults from '$lib/components/EmptyResults.svelte'

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
			dataKey: 'country',
			cellComponent: CountryViewer
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
			dataKey: 'typeEvent',
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
			cellComponent: EventStatusViewer
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

	const locations = [
		{ value: 0, title: 'South America', variant: 'secondary' },
		{ value: 1, title: 'North America', variant: 'secondary' },
		{ value: 2, title: 'Asia', variant: 'secondary' },
		{ value: 3, title: 'Europe', variant: 'secondary' },
		{ value: 4, title: 'Virtual', variant: 'secondary' }
	]

	const statuses = [
		{ value: 0, title: 'Inactive', variant: 'alert' },
		{ value: 1, title: 'Active', variant: 'success' },
		{ value: 2, title: 'Suspended', variant: 'error' }
	]

	const types = [
		{ value: 0, title: 'Live Events', variant: 'secondary' },
		{ value: 1, title: 'Virtual', variant: 'secondary' }
	]

	afterNavigate(async () => {
		try {
			params = validateUrlSearchParams($page.url.searchParams, organizerListSchema)
			if (params.order.length) {
				params.order = mapArrayIntoCollectionOrder(params.order, tableColumns)
			}
			if (params.locations.length) {
				params.status = mapArrayIntoCollection(params.location, locations, 'value')
			}
			if (params.status.length) {
				params.status = mapArrayIntoCollection(params.status, statuses, 'value')
			}
			if (params.typeEvent.length) {
				params.typeEvent = mapArrayIntoCollection(params.typeEvent, types, 'value')
			}
		} catch (error) {}
		await fetchEvents()
	})

	async function fetchEvents() {
		loading = true
		const url = new URL('/api/events', window.location.origin)
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
					link: `/events/${item.id}`,
					country: item.venue.country
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
	<title>Events</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col w-full px-4">
	<div class="flex justify-between pt-12">
		<div>
			<h2>Events List</h2>
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
				items={locations}
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
				<span slot="title">Location</span>
				<div class="text-xl" slot="leading">
					<Board />
				</div>
			</Dropdown>
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
			<ExportCsvButton urlPrefix="events" />
		</div>
	</div>
	<div class="w-full flex py-4 gap-4">
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
			columns={tableColumns}
			data={data?.results}
			maxItemsPerPage={itemsPerPage}
			sortedColumns={params.order}
			{loading}
			{pageCount}
		/>
	{/if}
	{#if !loading && !data?.results.length}
		<EmptyResults
			title="No results found / try adjusting your search or filter to find what you’re looking for"
		/>
	{/if}
</section>

<style>
</style>
