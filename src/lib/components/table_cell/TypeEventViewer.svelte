<script lang="ts">
	import LiveEvent from '../icons/LiveEvent.svelte'
	import VirtualEvent from '../icons/VirtualEvent.svelte'

	export let value: number
</script>

<div class="w-full h-full flex items-center justify-center gap-2 text-primary-purple">
	{#if !value}
		<VirtualEvent />
		<span> Virtual </span>
	{:else}
		<LiveEvent />
		<span> Live </span>
	{/if}
</div>
