<script lang="ts">
	import LiveEvent from '../icons/LiveEvent.svelte'
	import VirtualEvent from '../icons/VirtualEvent.svelte'

	export let value: number
</script>

<div class="w-full h-full flex items-center justify-center gap-2 text-primary-purple">
	{#if value == 1}
		<VirtualEvent />
		<span> Virtual </span>
	{:else if value == 0}
		<LiveEvent />
		<span> Live </span>
	{:else}
		<div class="flex gap-x-2 items-center justify-center">
			<div class="flex gap-x-1 items-center">
				<LiveEvent />
				<span> Live </span>
			</div>
			/
			<div class="flex gap-x-1 items-center">
				<VirtualEvent />
				<span> Virtual </span>
			</div>
		</div>
	{/if}
</div>
