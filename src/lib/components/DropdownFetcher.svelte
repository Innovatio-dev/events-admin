<script lang="ts">
	import { createDebouncer } from '$lib/utils/debounce'
	import Dropdown, { type IDropDownItem } from './Dropdown.svelte'
	export let filterPlaceholder: string = ''
	export let placeholder: string = ''
	export let selected: IDropDownItem | IDropDownItem[] | null
	export let multiselect: boolean = false
	export let url: string
	export let searchField: string
	export let valueField: string
	export let titleField: string
	export let name: string = ''
	export let value: string = ''
	let items: IDropDownItem[] = []
	let loading: boolean = false
	let filter: string = ''
	let searchDebouncer = createDebouncer(async () => {
		loading = true
		const params = new URLSearchParams({ [searchField]: filter })
		const generatedUrl = `${url}?${params.toString()}`
		let response = await fetch(generatedUrl, {
			method: 'get'
		})
		let data = await response.json()
		if (response.ok) {
			items = data.results.map((item) => ({
				value: item[valueField],
				title: item[titleField]
			}))
		} else {
			items = []
		}
		loading = false
	}, 400)

	function handleFilterChange(event) {
		filter = event.detail
		searchDebouncer.debounce()
	}
</script>

<Dropdown
	{name}
	width="100%"
	filterable={true}
	manualFilter={true}
	{loading}
	{filterPlaceholder}
	on:filterChange={handleFilterChange}
	bind:multiselect
	bind:value
	{items}
	bind:selected
>
	<svelte:fragment slot="title">{placeholder}</svelte:fragment></Dropdown
>
