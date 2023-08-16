<script context="module" lang="ts">
	import { createEventDispatcher, type SvelteComponent } from 'svelte'
	export type CellDataGenerator = (item: any) => any
	export interface Column {
		title: string
		cellComponent?: typeof SvelteComponent
		cellDataGenerator?: CellDataGenerator
		alignHeader?: 'center' | 'start' | 'end'
		alignRow?: 'center' | 'start' | 'end'
		grow?: string
		dragHandler?: boolean
		minWidth?: string
		maxWidth?: string
		width?: string
	}
</script>

<script lang="ts">
	import { fly } from 'svelte/transition'
	import { SortableList } from '@jhubbardsf/svelte-sortablejs'
	export let columns: Column[]
	export let data: any[] = []
	export let rowHeight: string = '4em'
	export let emptyMessage: string = 'There are no items'
	export let orderable: boolean = true
	const eventDispatcher = createEventDispatcher()
	$: orderedData = [...data]

	function getColumnStyle(column: Column) {
		const styles: string[] = []
		styles.push(`flex-grow: ${column.grow ?? '1'}`)
		styles.push(`min-width: ${column.minWidth ?? '0px'}`)
		styles.push(`max-width: ${column.maxWidth ?? '100%'}`)
		styles.push(`width: ${column.width ?? '2em'}`)
		styles.push(`justify-content: ${column.alignHeader ?? 'center'}`)
		return styles.join(';')
	}
	function handleOnSort(event) {
		const newArray = [...orderedData]
		newArray.splice(event.oldIndex, 1)
		newArray.splice(event.newIndex, 0, orderedData[event.oldIndex])
		orderedData = newArray
		eventDispatcher('orderChange', orderedData)
	}
</script>

<div class="table">
	<div class="header">
		{#each columns as column}
			<div class="header-item" style={getColumnStyle(column)}>
				<span>
					{column.title}
				</span>
			</div>
		{/each}
	</div>
	<div class="body">
		<div class="rows-container">
			{#if data.length}
				<SortableList class="" animation={150} onSort={handleOnSort}>
					{#each data as row, index (row?.id)}
						<div
							class="row"
							data-id={row.id}
							style={`height: ${rowHeight}`}
							in:fly={{
								duration: 500,
								y: 100
							}}
						>
							{#each columns as column}
								<div class="cell" style={getColumnStyle(column)}>
									{#if column.cellComponent}
										<svelte:component
											this={column.cellComponent}
											value={column.cellDataGenerator
												? column.cellDataGenerator(row)
												: row}
										/>
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				</SortableList>
			{:else}
				<div class="empty-message">{emptyMessage}</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.table {
		position: relative;
		width: 100%;
		overflow-x: auto;
		display: flex;
		flex-flow: column;
		cursor: default;
	}
	.header {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gd-icon);
		border-radius: 1em 1em 0 0;
		user-select: none;
		height: 4em;
		.header-item {
			color: var(--white);
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
		}
	}
	.body {
		width: 100%;
		position: relative;
		background-color: var(--white);
		border-radius: 0 0 1em 1em;
		overflow: hidden;
		.rows-container {
			position: relative;
			width: 100%;
			.empty-message {
				padding: 1em;
				color: var(--neutral-4);
			}
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
</style>
