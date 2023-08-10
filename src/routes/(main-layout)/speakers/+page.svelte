<script lang="ts">
	// Svelte
	import { afterNavigate, goto } from '$app/navigation'
	import { page } from '$app/stores'
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Badge from '$lib/components/Badge.svelte'
	import type { Column } from '$lib/components/SortableTable.svelte'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import PhotoViewer from '$lib/components/table_cell/PhotoViewer.svelte'
	import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'
	import EmptyResults from '$lib/components/EmptyResults.svelte'
	import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
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
	import AiOutlinePlus from 'svelte-icons-pack/ai/AiOutlinePlus'
	import ExportCsvButton from '$lib/components/custom/ExportCSVButton.svelte'

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
			title: 'Speaker Name',
			sortable: true,
			dataKey: 'name',
			minWidth: '16.6%',
			grow: '0'
		},
		{
			title: 'Speaker Company',
			sortable: false,
			dataKey: 'company',
			minWidth: '16.6%',
			grow: '0'
		},
		{
			title: 'Country',
			sortable: true,
			dataKey: 'country',
			minWidth: '16.6%',
			grow: '0',
			cellComponent: CountryViewer
		},
		{
			title: 'Role / position',
			sortable: false,
			dataKey: 'jobRole',
			minWidth: '16.6%',
			grow: '0'
		},
		{
			title: 'Photo',
			sortable: false,
			dataKey: 'picture',
			minWidth: '16.6%',
			cellComponent: PhotoViewer,
			grow: '0'
		},
		{
			title: 'Details',
			sortable: false,
			cellComponent: SeeMoreButton,
			minWidth: '10%',
			grow: '0',
			dataKey: 'link'
		}
	]

	const types = [
		{ value: 0, title: 'Live Events', variant: 'secondary' },
		{ value: 1, title: 'Virtual', variant: 'secondary' }
	]

	afterNavigate(async () => {
		try {
			params = validateUrlSearchParams($page.url.searchParams, organizerListSchema)
			if (params.typeEvent.length) {
				params.typeEvent = mapArrayIntoCollection(params.typeEvent, types, 'value')
			}
			if (params.order.length) {
				params.order = mapArrayIntoCollectionOrder(params.order, tableColumns)
			}
		} catch (error) {}
		await fetchSpeakers()
	})

	async function fetchSpeakers() {
		loading = true
		const url = new URL('/api/speakers', window.location.origin)
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
					link: `/speakers/${item.id}`
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
	<title>{'Speakers'}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col w-full px-4">
	<div class="flex justify-between pt-12">
		<div>
			<h2>{'Speaker List'}</h2>
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
			<ExportCsvButton urlPrefix="speakers" />
		</div>
	</div>
	<div class="w-full flex py-4 gap-4">
		<div class="w-fit min-w-fit">
			<MainButton href="/speakers/new-speaker">
				<Icon className="h-6 w-6" src={AiOutlinePlus} />
				{'Create speaker'}
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
	{#if !loading && !data?.results.length}
		<EmptyResults
			title="No results found / try adjusting your search or filter to find what you’re looking for"
		/>
	{/if}
</section>

<style>
</style>
