<script context="module" lang="ts">
	import { createEventDispatcher, tick, type SvelteComponent } from 'svelte'
	import IoCaretForward from 'svelte-icons-pack/io/IoCaretForward'
	import IoCaretBack from 'svelte-icons-pack/io/IoCaretBack'
	export interface Column {
		title: string
		sortable: boolean
		cellComponent?: typeof SvelteComponent
		alignHeader?: 'center' | 'start' | 'end'
		alignRow?: 'center' | 'start' | 'end'
		grow?: string
		minWidth?: string
		maxWidth?: string
		width?: string
		dataKey?: string
	}
	export interface SortableColumn {
		column: Column
		type: 'asc' | 'desc' | null
		index: number | null
	}
</script>

<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import { fly } from 'svelte/transition'
	import { Circle3 } from 'svelte-loading-spinners'
	import TiArrowUnsorted from 'svelte-icons-pack/ti/TiArrowUnsorted'
	import TiArrowSortedUp from 'svelte-icons-pack/ti/TiArrowSortedUp'
	import TiArrowSortedDown from 'svelte-icons-pack/ti/TiArrowSortedDown'
	import TextViewer from './table_cell/TextViewer.svelte'

	export let columns: Column[]

	export let data: any[] | null = []
	export let pageCount: number = 1
	export let maxItemsPerPage: number = 3
	export let rowHeight: string = '4em'
	export let currentPage: number = 1
	export let loading: boolean = false
	export let multiSort: boolean = false
	let innerColumns: SortableColumn[]
	export let sortedColumns: SortableColumn[] = []

	const eventDispatcher = createEventDispatcher()

	$: {
		innerColumns = []
		for (let column of columns) {
			const sortedCol = sortedColumns.find((sorted) => sorted.column == column)
			innerColumns.push({
				column,
				index: sortedCol ? sortedCol.index : null,
				type: sortedCol ? sortedCol.type : null
			})
		}
	}

	function onColumnClick(innerColumn: SortableColumn) {
		if (innerColumn.column.sortable) {
			let newSorted: SortableColumn[] = []
			if (innerColumn.type == 'asc') {
				//Sorted is the same array size but clicked column changed sort to desc
				newSorted = sortedColumns.map((sorted) => {
					return {
						...sorted,
						type: sorted.column === innerColumn.column ? 'desc' : sorted.type
					}
				})
			} else if (innerColumn.type == 'desc') {
				//Sorted now removing column
				for (let sorted of sortedColumns) {
					if (sorted.column != innerColumn.column) {
						newSorted.push({
							...sorted,
							index:
								sorted.index! > innerColumn.index!
									? sorted.index! - 1
									: sorted.index
						})
					}
				}
			} else {
				//Now adding to sortedlist
				if (multiSort) {
					newSorted = sortedColumns.map((sorted) => ({ ...sorted }))
				}
				newSorted.push({
					column: innerColumn.column,
					index: newSorted.length + 1,
					type: 'asc'
				})
			}
			sortedColumns = newSorted
			eventDispatcher('sortChange', sortedColumns)
		}
	}
	function getColumnStyle(column: Column) {
		const styles: string[] = []
		styles.push(`flex-grow: ${column.grow ?? '1'}`)
		styles.push(`min-width: ${column.minWidth ?? '0px'}`)
		styles.push(`max-width: ${column.maxWidth ?? '100%'}`)
		styles.push(`width: ${column.width ?? '2em'}`)
		return styles.join(';')
	}

	function nextPage() {
		if (currentPage < pageCount) {
			currentPage++
			eventDispatcher('pageChange', currentPage)
		}
	}

	function gotoPage(page: number) {
		if (page > 0 && page <= pageCount && page != currentPage) {
			currentPage = page
			eventDispatcher('pageChange', currentPage)
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			currentPage--
			eventDispatcher('pageChange', currentPage)
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="table">
	<div class="header">
		{#each innerColumns as innerColumn}
			<div
				class="header-item"
				style={getColumnStyle(innerColumn.column)}
				class:clickable={innerColumn.column.sortable}
				on:click={() => {
					onColumnClick(innerColumn)
				}}
			>
				<span>
					{innerColumn.column.title}
				</span>
				{#if innerColumn.column.sortable}
					<div class="header-item-sort">
						{#if innerColumn.type == null}
							<Icon src={TiArrowUnsorted} color="currentColor" />
						{:else if innerColumn.type == 'asc'}
							<Icon src={TiArrowSortedUp} color="currentColor" />
						{:else}
							<Icon src={TiArrowSortedDown} color="currentColor" />
						{/if}
					</div>
					{#if innerColumn.index != null && multiSort}
						<div class="header-item-sort-index">
							{innerColumn.index}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
	<div class="body">
		{#if loading}
			<div class="loader" style={`height: calc(${maxItemsPerPage} * ${rowHeight})`}>
				<Circle3
					ballBottomLeft={'#14dcff'}
					ballBottomRight={'#fd369d'}
					ballTopRight={'#8863e08f'}
					ballTopLeft={'#ffa5d3'}
				/>
			</div>
		{:else if data}
			<div class="rows-container">
				{#each data as row, index}
					<div
						class="row"
						style={`height: ${rowHeight}`}
						in:fly={{
							duration: 500,
							y: 100,
							delay: 200 * index
						}}
					>
						{#each columns as column}
							<div class="cell" style={getColumnStyle(column)}>
								{#if column.cellComponent}
									<svelte:component
										this={column.cellComponent}
										value={column.dataKey != null ? row[column.dataKey] : row}
									/>
								{:else if column.dataKey && row[column.dataKey] != null}
									<TextViewer value={row[column.dataKey]} />
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	
	{#if data?.length}
		<div class="footer">
			<div class="pagination">
				{#each new Array(pageCount).fill(0) as page, index}
					<div
						class="nav-button"
						class:selected={index == currentPage - 1}
						on:click={() => gotoPage(index + 1)}
					>
						{index + 1}
					</div>
				{/each}
			</div>
			<div class="nav">
				<div class="nav-button" on:click={previousPage}>
					<Icon src={IoCaretBack} color="currentColor" />
				</div>
				<div class="nav-button" on:click={nextPage}>
					<Icon src={IoCaretForward} color="currentColor" />
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.table {
		position: relative;
		width: 100%;
		overflow-x: auto;
		display: flex;
		flex-flow: column;
		gap: 1em;
		cursor: default;
		.header {
			position: relative;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: var(--white);
			border-radius: 1em;
			user-select: none;
			height: 4em;
			.header-item {
				color: var(--neutral-4);
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0em;
				font-weight: 500;
				span {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				&.clickable {
					cursor: pointer;
					&:hover {
						color: var(--neutral-5);
					}
				}
				.header-item-sort-index {
					display: flex;
					width: 2em;
					height: 2em;
					align-items: center;
					justify-content: center;
					background-color: var(--neutral-1);
					border-radius: 50%;
				}
			}
		}
		.body {
			width: 100%;
			position: relative;
			background-color: var(--white);
			border-radius: 1em;
			overflow: hidden;
			.loader {
				height: 50vh;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.rows-container {
				position: relative;
				width: 100%;
			}
			.row {
				display: flex;
				width: 100%;
				align-items: center;
				justify-content: center;
				height: 4em;
				color: var(--neutral-3);
				transition: background-color 0.2s ease-in-out;
				&:hover {
					background-color: var(--neutral-1);
					color: var(--neutral-4);
				}
				&:not(:last-child) {
					border-bottom: 1px solid var(--neutral-1);
				}
				.cell {
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					// overflow: hidden;
				}
			}
		}
		.footer {
			display: flex;
			overflow: hidden;
			gap: 1rem;

			.nav-button {
				width: 2.5em;
				height: 2.5em;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 0.5em;
				background-color: var(--white);
				color: var(--neutral-4);
				cursor: pointer;
				&:hover {
					color: var(--neutral-5);
					background-color: var(--neutral-1);
				}
				&.selected {
					color: var(--neutral-5);
					box-shadow: inset 0px 0px 0.3em 0px rgb(86 86 86 / 42%);
					background-color: var(--neutral-1);
					cursor: default;
				}
			}

			.pagination {
				flex-grow: 1;
				display: flex;
				gap: 1rem;
			}
			.nav {
				display: flex;
				gap: 1rem;
			}
		}
	}
</style>
