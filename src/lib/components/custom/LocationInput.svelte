<script lang="ts">
	// Svelte
	import Input from '../Input.svelte'
	import { onMount } from 'svelte'
	// Icons
	import AiOutlineSearch from 'svelte-icons-pack/ai/AiOutlineSearch'
	import Icon from 'svelte-icons-pack'
	// Animations
	import { slide } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import type { SearchResult } from 'leaflet-geosearch/dist/providers/provider'
	import type { RawResult } from 'leaflet-geosearch/dist/providers/openCageProvider'

	// Props
	export let data = {}

	// State
	let containerElement: HTMLElement
	let typedData = ''
	let results: SearchResult<RawResult>[] = []
	let provider

	// Constants
	import { countries, REGIONS } from '$lib/utils/constants/Regions'

	onMount(async () => {
		const geoSearch = await import('leaflet-geosearch')
		provider = new geoSearch.OpenCageProvider({
			params: {
				key: '0b893a83f3394b3f80634c1debe238a4',
				language: 'en'
			}
		})
	})

	const fetchLocation = async (e) => {
		try {
			const response = await provider.search({ query: typedData })
			results = response
			// console.log(results)
		} catch (error) {
			console.log({ error })
		}
	}

	const handleClickOutside = (event: MouseEvent) => {
		if (!containerElement.contains(event.target as HTMLElement)) {
			results = []
		}
	}

	const handleClickItem = (index) => {
		let continent = results[index].raw.components.continent
		let countryCode = results[index].raw.components.country_code

		let regionId = REGIONS.find((obj) => obj.name === continent)?.id ?? -1
		let countryId = countries.find((obj) => obj.iso === countryCode.toUpperCase())?.id ?? -1

		data = {
			country: results[index].raw.components.country ?? '-',
			city: results[index].raw.components.city ?? '-',
			address: results[index].label ?? '-',
			location: { lat: results[index].y, lng: results[index].x } ?? '-',
			regionId,
			countryId
		}
		// console.log(data)
		results = []
	}
</script>

<svelte:window on:click={handleClickOutside} />
<div bind:this={containerElement} class="relative">
	<Input
		placeholder="Type the venue location"
		label="Location finder"
		bind:value={typedData}
		type="text"
		on:change={fetchLocation}
	>
		<Icon slot="trailing" src={AiOutlineSearch} color="currentColor" />
	</Input>
	{#if results.length}
		<div class="list" transition:slide={{ delay: 0, duration: 300, easing: quintOut }}>
			{#each results as item, index}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="item" on:click={() => handleClickItem(index)}>{item.label}</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.list {
		top: calc(100% + 12px);
		position: absolute;
		z-index: 1;
		background: var(--white);
		border: 1.3px solid #f3f1ff;
		box-shadow: 0px 3px 12px rgba(51, 51, 51, 0.1);
		border-radius: 10px;
		width: 100%;
		min-width: 100px;
		cursor: pointer;
		max-height: 50vh;
		overflow-y: auto;
		.item {
			color: var(--neutral-4);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			padding: 15px;
			&:hover {
				background-color: var(--primary-light);
			}
		}
	}
</style>
