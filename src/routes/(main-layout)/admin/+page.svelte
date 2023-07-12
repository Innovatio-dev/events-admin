<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import SortableTable from '$lib/components/SortableTable.svelte'
	import type { Column } from '$lib/components/SortableTable.svelte'
	import MailViewer from '$lib/components/table_cell/MailViewer.svelte'
	import DateViewer from '$lib/components/table_cell/DateViewer.svelte'
	import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Icon from 'svelte-icons-pack'
	import AiOutlinePlus from 'svelte-icons-pack/ai/AiOutlinePlus'
	import AiOutlineSearch from 'svelte-icons-pack/ai/AiOutlineSearch'
	import AiOutlineCloudDownload from 'svelte-icons-pack/ai/AiOutlineCloudDownload'
	import Input from '$lib/components/Input.svelte'
	import { createDebouncer } from '$lib/utils/debounce'
	import { createUrl } from '$lib/utils/validation/validation'
	import { goto } from '$app/navigation'

	let data: any = null
	let loading = false
	let error = false
	let pageCount = 0
	let itemsPerPage = 5
	let params: any = {
		typeAdmin: [],
		status: [],
		order: [],
		search: null,
		page: 1
	}

	onMount(() => {
		getAdmins()
	})

	async function getAdmins() {
		try {
			loading = true
			error = false
			const res = await fetch(`${$page.url.origin}/api/admins`)
			if (res.ok) {
				data = await res.json()
			}
		} catch (error) {
			console.log(error)
			error = true
		} finally {
			loading = false
		}
	}

	let tableColumns: Column[] = [
		{
			title: 'Admin Name',
			sortable: true,
			dataKey: 'name'
		},
		{
			title: 'Email Address',
			sortable: true,
			dataKey: 'email',
			cellComponent: MailViewer,
			minWidth: '180px'
		},
		{
			title: 'Date Joined',
			sortable: true,
			dataKey: 'createdAt',
			grow: '0',
			minWidth: '11em',
			cellComponent: DateViewer
		},
		{
			title: 'Type Admin',
			sortable: true,
			dataKey: 'name'
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

	let searchDebouncer = createDebouncer(() => {
		gotoFilter({
			search: params.search != '' ? params.search : null,
			page: 1
		})
	}, 400)

	function onSearchChange(event) {
		searchDebouncer.debounce()
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

	function onPageChange(event) {
		let page = event.detail
		gotoFilter({
			page
		})
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
</script>

<section class="flex flex-col gap-4 w-full px-4">
	<div class="flex justify-between pt-12">
		<h2>Admin Panel</h2>
		<div class="flex gap-x-4 max-h-12 z-50">
			<Input
				placeholder="Search"
				on:keypress={onSearchKeypress}
				on:change={onSearchChange}
				bind:value={params.search}
			>
				<Icon slot="trailing" src={AiOutlineSearch} color="currentColor" />
			</Input>

			<MainButton>
				<Icon className="h-6 w-6" src={AiOutlineCloudDownload} />
				{'Export CSV'}
			</MainButton>
		</div>
	</div>

	<div class="w-fit min-w-fit">
		<MainButton href="/admin/create">
			<Icon className="h-6 w-6" src={AiOutlinePlus} />
			{'New Admin'}
		</MainButton>
	</div>

	{#if !error}
		<SortableTable
			bind:currentPage={params.page}
			on:pageChange={onPageChange}
			on:sortChange={onSortChange}
			columns={tableColumns}
			data={data?.results}
			maxItemsPerPage={itemsPerPage}
			{loading}
			{pageCount}
		/>
	{/if}
</section>
