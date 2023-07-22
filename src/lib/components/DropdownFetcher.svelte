<script lang="ts">
	import { createDebouncer } from '$lib/utils/debounce'
	import { SvelteComponent, onMount } from 'svelte'
	import Dropdown, { type ValueGenerator } from './Dropdown.svelte'
	import TextWithImageViewer from './custom/data_viewer/TextWithImageViewer.svelte'
	import SimpleTextViewer from './custom/data_viewer/SimpleTextViewer.svelte'
	export let filterPlaceholder: string = ''
	export let placeholder: string = ''
	export let selected: any | any[] | null
	export let multiselect: boolean = false
	export let url: string
	export let searchField: string = 'search'
	export let name: string = ''
	export let value: string = ''
	export let itemViewer: typeof SvelteComponent = TextWithImageViewer
	export let selectedViewer: typeof SvelteComponent = SimpleTextViewer
	export let valueGenerator: ValueGenerator = (item) => {
		return item.id
	}
	let items: any[] = []
	let loading: boolean = false
	let filter: string = ''
	let limit = 10
	let limitReach = false
	let scrollerRef: HTMLDivElement | null = null
	let searchDebouncer = createDebouncer(async () => {
		items = []
		limitReach = false
		fetchMoreData()
	}, 400)

	onMount(() => {
		searchDebouncer.debounce()
		scrollerRef?.addEventListener('scroll', handleDropdownScroll)
	})
	function handleFilterChange(event) {
		filter = event.detail
		searchDebouncer.debounce()
	}
	function handleDropdownScroll() {
		if (!scrollerRef) return

		if (
			scrollerRef.scrollHeight - scrollerRef.scrollTop == scrollerRef.clientHeight &&
			!loading &&
			!limitReach
		) {
			fetchMoreData()
		}
	}

	async function fetchMoreData() {
		loading = true
		const params = new URLSearchParams({
			[searchField]: filter,
			offset: items.length.toString(),
			limit: limit.toString()
		})
		const generatedUrl = `${url}?${params.toString()}`
		let response = await fetch(generatedUrl, {
			method: 'get'
		})
		let data = await response.json()
		if (response.ok) {
			items = items.concat(data.results)
			if (items.length >= data.count) {
				limitReach = true
			}
		}
		loading = false

		handleDropdownScroll()
	}
</script>

<Dropdown
	{name}
	width="100%"
	filterable={true}
	manualFilter={true}
	bind:scrollerRef
	on:filterChange={handleFilterChange}
	bind:multiselect
	bind:value
	{items}
	bind:selected
	{itemViewer}
	{selectedViewer}
	{loading}
	{filterPlaceholder}
	{valueGenerator}
	height={'300px'}
>
	<svelte:fragment slot="title">{placeholder}</svelte:fragment></Dropdown
>