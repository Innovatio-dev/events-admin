<script lang="ts" context="module">
	export type FilterFunction = (item: any, filter: string) => boolean
	export type ValueGenerator = (item: any) => any
	export type ItemGenerator = (item: any) => any
	interface InternalItem {
		item: any
		selected: boolean
		filtered: boolean
	}
</script>

<script lang="ts">
	import { slide } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import Arrow from './icons/Arrow.svelte'
	import Check from './icons/Check.svelte'
	import Input from './Input.svelte'
	import Search from './icons/Search.svelte'
	import { SvelteComponent, createEventDispatcher, tick } from 'svelte'
	import { Circle3 } from 'svelte-loading-spinners'
	import Popup from './Popup.svelte'
	import SimpleTextViewer from './custom/data_viewer/SimpleTextViewer.svelte'
	import TextWithImageViewer from './custom/data_viewer/TextWithImageViewer.svelte'

	export let items: any[] = []
	export let selected: any[] | any | null = null
	export let multiselect: boolean = false
	export let filterable: boolean = false
	export let manualFilter: boolean = false
	export let loading: boolean = false
	export let filterPlaceholder: string = 'Filter'
	export let width: string = 'fit-content'
	export let height: string = 'fit-content'
	export let name: string = ''
	export let value: string = ''
	export let scrollerRef: HTMLDivElement | null = null
	export let itemViewer: typeof SvelteComponent = TextWithImageViewer
	export let selectedViewer: typeof SvelteComponent = SimpleTextViewer
	export let valueGenerator: ValueGenerator = (item) => item.value
	export let itemGenerator: ItemGenerator = (item) => ({ title: item.title, image: item.image })
	export let filterFunction: FilterFunction | null = (item: any, filter: string) => {
		return !item.title.toLowerCase().includes(filter)
	}

	let style: string = ''
	let opened = false
	let containerElement: HTMLElement
	let popupRef: Popup
	let filter: string = ''
	let filterRef: Input | null = null
	let internalItems: InternalItem[]

	const eventDispatcher = createEventDispatcher()

	function updateSelected(items: any[], selected: any | any[] | null) {
		return items.map((item, i) => {
			return {
				item: item,
				selected: Array.isArray(selected) ? selected.includes(item) : selected == item,
				filtered: false
			}
		})
	}
	$: hasSelection = Array.isArray(selected) ? selected.length > 0 : selected != null
	$: value = Array.isArray(selected)
		? selected.map((item) => valueGenerator(item)).join(',')
		: selected
		? (valueGenerator(selected) as string)
		: ''

	// Update the internal items when the items or selected props change
	$: {
		internalItems = updateSelected(items, selected)
	}
	// Filter the internal items when the filter is changed
	$: {
		if (filter.length > 0 && !manualFilter && filterFunction) {
			internalItems = internalItems.map((internalItem) => ({
				...internalItem,
				filtered: filterFunction!(internalItem.item, filter)
			}))
		} else {
			internalItems = internalItems.map((internalItem) => ({
				...internalItem,
				filtered: false
			}))
		}
	}

	$: {
		style = `width: ${width}; min-width: ${width}`
	}

	// Define a function to handle clicking on an item in the dropdown menu, if event is cancelled no changes are reflected
	const handleClickItem = (index: number) => {
		if (multiselect) {
			const newSelected: any[] = []
			const newItems: InternalItem[] = []
			for (let i = 0; i < internalItems.length; i++) {
				newItems.push({
					...internalItems[i],
					selected: i == index ? !internalItems[i].selected : internalItems[i].selected
				})
				if (newItems[i].selected) {
					newSelected.push(newItems[i].item)
				}
			}
			const canContinue = eventDispatcher(
				'change',
				{ selected: newSelected },
				{ cancelable: true }
			)
			if (canContinue) {
				internalItems = newItems
				selected = newSelected
			}
		} else {
			const canContinue = eventDispatcher(
				'change',
				{ selected: internalItems[index].item },
				{ cancelable: true }
			)
			if (canContinue) {
				internalItems.forEach((item, i) => {
					item.selected = index == i
				})
				selected = internalItems[index].item
			}
			popupRef.hide()
		}
	}

	function handleFilterChange(event) {
		eventDispatcher('filterChange', filter)
	}
</script>

<!-- <svelte:window on:click={handleClickOutside} /> -->

<div bind:this={containerElement} class="container" {style}>
	<input {name} class="input" type="hidden" {value} />
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="active"
		class:opened
		class:hasSelections={hasSelection}
		on:click={() => popupRef.show()}
	>
		{#if $$slots.leading}
			<div class="leading">
				<slot name="leading" />
			</div>
		{/if}
		{#if Array.isArray(selected) || !selected}
			<div class="text">
				<slot name="title" />
			</div>
		{:else}
			<div class="text">
				<svelte:component this={selectedViewer} value={itemGenerator(selected)} />
			</div>
		{/if}
		<!-- {#if Array.isArray(selected)}
            <div class="counter">
                {selected.length}
            </div>
        {/if} -->
		<div class="trailing">
			<Arrow />
		</div>
	</div>
</div>
<Popup
	bind:this={popupRef}
	trigger={containerElement}
	on:hide={() => (opened = false)}
	on:show={() => {
		opened = true
		if (filterRef) {
			filterRef.focus()
		}
	}}
>
	<div
		class="list"
		style={`height:${height};overflow-y:${height == 'fit-content' ? 'unset' : 'auto'}`}
		bind:this={scrollerRef}
		transition:slide={{ delay: 0, duration: 300, easing: quintOut }}
	>
		{#if filterable}
			<div
				class="sticky bg-white z-10"
				style={`top: ${height == 'fit-content' ? '0.5em' : '0px'}`}
			>
				<Input
					bind:this={filterRef}
					bind:value={filter}
					on:change={handleFilterChange}
					placeholder={filterPlaceholder}
					type="text"
				>
					<Search slot="trailing" />
				</Input>
				<div class="w-full h-[1px] bg-neutral-1 mt-2 mb-2" />
			</div>
		{/if}

		{#each internalItems as internalItem, index}
			{#if !internalItem.filtered}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="item" on:click={() => handleClickItem(index)}>
					<div class="viewer">
						<svelte:component
							this={itemViewer}
							value={itemGenerator(internalItem.item)}
						/>
					</div>
					<div class="check">
						{#if internalItem.selected}
							<Check />
						{/if}
					</div>
				</div>
			{/if}
		{/each}
		{#if loading}
			<div class="loader">
				<Circle3
					ballBottomLeft={'#14dcff'}
					ballBottomRight={'#fd369d'}
					ballTopRight={'#8863e08f'}
					ballTopLeft={'#ffa5d3'}
				/>
			</div>
		{/if}
	</div>
</Popup>

<style lang="scss">
	.active {
		display: flex;
		align-items: center;
		font-size: 16px;
		padding: calc(12 / 16 * 1em) calc(21 / 16 * 1em);
		gap: calc(21 / 16 * 1em);
		line-height: 24px;
		font-weight: 500;
		letter-spacing: 0.5px;
		position: relative;
		color: var(--neutral-4);
		cursor: pointer;
		&::before {
			background: var(--neutral-4);
			border-radius: calc(10 / 16 * 1em);
			content: '';
			inset: 0;
			padding: 2px;
			position: absolute;
			z-index: 1;
			-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
			mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
			-webkit-mask-composite: xor;
			mask-composite: exclude;
		}
		&::after {
			opacity: 0;
			background: var(--gd-linear);
			border-radius: calc(10 / 16 * 1em);
			content: '';
			inset: 0;
			padding: 2px;
			position: absolute;
			z-index: 2;
			-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
			mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
			-webkit-mask-composite: xor;
			mask-composite: exclude;
		}
		&:hover,
		&.opened {
			background: var(--gd-icon);
			color: var(--white);
			border-radius: calc(10 / 16 * 1em);
			&::before {
				opacity: 0;
			}
			&::after {
				opacity: 1;
			}
		}
		&.hasSelections {
			&::before {
				opacity: 0;
			}
			&::after {
				opacity: 1;
			}
		}
		.trailing,
		.leading {
			width: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.trailing {
			transition: transform 0.2s ease-in-out;
		}
		.text {
			flex-grow: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		&.opened {
			.trailing {
				transform: rotate(-180deg);
			}
		}
	}
	.container {
		position: relative;
		width: fit-content;
		user-select: none;
	}
	.list {
		background: var(--white);
		width: 100%;
		padding: 0.5em;
		overflow-y: auto;
		cursor: pointer;

		.loader {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100px;
		}
		.item {
			border-radius: 10px;
			height: 3em;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--neutral-4);
			// gap: 0.8em;
			.viewer {
				flex-grow: 1;
			}

			.check {
				color: var(--primary-purple);
				width: 16px;
				position: relative;
				margin-right: 0.8em;
			}
			&:hover {
				background-color: var(--primary-light);
			}
		}
	}
</style>
