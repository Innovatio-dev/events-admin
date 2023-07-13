<script lang="ts">
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import AiOutlineCloudDownload from 'svelte-icons-pack/ai/AiOutlineCloudDownload'
	import AiOutlineSearch from 'svelte-icons-pack/ai/AiOutlineSearch'
	import AiOutlinePlus from 'svelte-icons-pack/ai/AiOutlinePlus'
	import Icon from 'svelte-icons-pack'
	import { page } from '$app/stores'
	import { afterNavigate, goto } from '$app/navigation'
	import Badge from '$lib/components/Badge.svelte'
	import type { Column } from '$lib/components/SortableTable.svelte'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
	import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'
	import {
		createUrl,
		mapArrayIntoCollection,
		mapArrayIntoCollectionOrder,
		validateUrlSearchParams
	} from '$lib/utils/validation/validation'
	import { createDebouncer } from '$lib/utils/debounce'
	import LocationViewer from '$lib/components/table_cell/LocationViewer.svelte'
	import { organizerListSchema } from '$lib/utils/validation/schemas'

	let inputElement
	let loading: boolean = true
	let data: any = null
	let error: any = null
	let itemsPerPage = 5
	let pageCount = 0
	let params: any = {
		typeEvent: [],
		status: [],
		order: [],
		search: null,
		page: 1
	}
	const types = [
		{ value: 0, title: 'Live Events', variant: 'secondary' },
		{ value: 1, title: 'Virtual', variant: 'secondary' }
	]

	let searchDebouncer = createDebouncer(() => {
		gotoFilter({
			search: params.search != '' ? params.search : null,
			page: 1
		})
	}, 400)

	let tableColumns: Column[] = [
		{
			title: 'Organizer Name',
			sortable: true,
			dataKey: 'name'
		},
		{
			title: 'Location',
			sortable: true,
			dataKey: 'region',
			cellComponent: LocationViewer
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
			dataKey: 'city'
		},
		{
			title: 'G maps',
			sortable: false,
			dataKey: 'address'
		},
		{
			title: 'Action',
			sortable: false,
			cellComponent: SeeMoreButton,
			minWidth: '8em',
			grow: '0',
			dataKey: 'link'
		}
	]
	afterNavigate(async () => {
		try {
			params = validateUrlSearchParams($page.url.searchParams, organizerListSchema)
			if (params.typeEvent.length) {
				params.typeEvent = mapArrayIntoCollection(params.typeEvent, 'value')
			}
			if (params.order.length) {
				params.order = mapArrayIntoCollectionOrder(params.order, tableColumns)
			}
		} catch (error) {}
		await fetchVenues()
	})
	async function fetchVenues() {
		loading = true
		const url = new URL('/api/venues', window.location.origin)
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
					link: `/venues/${item.id}`
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
	<title>Venue</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col w-full px-4">
	<div class="flex justify-between pt-12">
		<div>
			<h2>Venue List</h2>
		</div>
		<div class="flex gap-x-4 max-h-12 z-50">
			<Input
				placeholder="Search"
				on:keypress={onSearchKeypress}
				on:change={onSearchChange}
				bind:value={params.search}
				domElement={inputElement}
			>
				<Icon slot="trailing" src={AiOutlineSearch} color="currentColor" />
			</Input>
			<MainButton>
				<Icon className="h-6 w-6" src={AiOutlineCloudDownload} />
				{'Export CSV'}
			</MainButton>
		</div>
	</div>
	<div class="w-full flex py-4 gap-4">
		<div class="w-fit min-w-fit">
			<MainButton href="/organizers/new-organizer">
				<Icon className="h-6 w-6" src={AiOutlinePlus} />
				{'Create Venue'}
			</MainButton>
		</div>
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
</section>

<style>
</style>
