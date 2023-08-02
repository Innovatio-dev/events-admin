<script lang="ts" context="module">
	export type ItemGenerator = (item: any) => any
</script>

<script lang="ts">
	import type { SvelteComponent } from 'svelte'

	export let items: any[] = []
	export let itemViewer: typeof SvelteComponent
	export let itemGenerator: ItemGenerator = (item) => item
	function handleClickItem(index) {
		if (index === items.length - 1) {
			document.forms['logout'].submit()
		}
	}
</script>

<form name='logout' class="list" action="/logout" method="post">
	{#if items.length}
		{#each items as row, index}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="item" on:click={() => handleClickItem(index)}>
				<div class="viewer">
					<svelte:component this={itemViewer} value={itemGenerator(row)} />
				</div>
			</div>
		{/each}
	{/if}
</form>

<style lang="scss">
	.list {
		background: var(--white);
		width: 100%;
		padding: 0.5em;
		overflow-y: auto;
		cursor: pointer;

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
