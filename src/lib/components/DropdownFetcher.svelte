<script lang="ts">
	import { createDebouncer } from '$lib/utils/debounce'
	import { SvelteComponent, createEventDispatcher, onMount } from 'svelte'
	import Dropdown, { type ItemGenerator, type ValueGenerator } from './Dropdown.svelte'
	import TextWithImageViewer from './custom/data_viewer/TextWithImageViewer.svelte'
	import SimpleTextViewer from './custom/data_viewer/SimpleTextViewer.svelte'
	export let filterPlaceholder: string = ''
	export let placeholder: string = ''
	export let selected: any | any[] | null = null
	export let multiselect: boolean = false
	export let url: string
	export let name: string = ''
	export let value: string = ''
	export let itemViewer: typeof SvelteComponent = TextWithImageViewer
	export let selectedViewer: typeof SvelteComponent = SimpleTextViewer
	export let itemGenerator: ItemGenerator = (item) => ({ title: item.title, image: item.image })
	export let selectedGenerator: ItemGenerator = (item) => ({ title: item.title })
	export let dataGenerator = (apiResponse: any) => ({
		count: apiResponse.count,
		results: apiResponse.results
	})
	export let valueGenerator: ValueGenerator = (item) => {
		return item.id
	}
	let eventDispatcher = createEventDispatcher()
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
		const params = {}
		let generatedUrl = url
		if (generatedUrl.includes('{s}')) {
			generatedUrl = generatedUrl.replace('{s}', encodeURIComponent(filter))
		}

		// Reemplazar '{o}' con el valor de la variable global 'offset'
		if (generatedUrl.includes('{o}')) {
			generatedUrl = generatedUrl.replace('{o}', encodeURIComponent(items.length.toString()))
		}

		// Reemplazar '{l}' con el valor de la variable global 'limit'
		if (generatedUrl.includes('{l}')) {
			generatedUrl = generatedUrl.replace('{l}', encodeURIComponent(limit.toString()))
		}
		let response = await fetch(generatedUrl, {
			method: 'get'
		})
		let data = await response.json()
		if (response.ok) {
			const parsedResult = dataGenerator(data)
			if (parsedResult.results) {
				items = items.concat(parsedResult.results)
			}
			if (!parsedResult.count || items.length >= parsedResult.count) {
				limitReach = true
			}
		} else {
			limitReach = true
		}
		loading = false

		handleDropdownScroll()
	}
	function handleOnChange(event) {
		const canContinue = eventDispatcher('change', event.detail, { cancelable: true })
		if (!canContinue) {
			event.preventDefault()
		}
	}
</script>

<Dropdown
	{name}
	width="100%"
	filterable={true}
	manualFilter={true}
	bind:scrollerRef
	on:filterChange={handleFilterChange}
	on:change={handleOnChange}
	bind:multiselect
	bind:value
	{items}
	bind:selected
	{itemViewer}
	{selectedViewer}
	{loading}
	{filterPlaceholder}
	{valueGenerator}
	{itemGenerator}
	{selectedGenerator}
>
	<svelte:fragment slot="title">{placeholder}</svelte:fragment></Dropdown
>
