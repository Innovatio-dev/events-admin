<script lang="ts">
	export let value: any
	import * as Flag from 'svelte-flag-icons'
	$: iso = value ? value.iso?.charAt(0).toUpperCase() + value.iso?.slice(1).toLowerCase() : null
</script>

<div class="flex w-[4.5rem] justify-between">
	{#if iso}
		<div class="min-w-[1.2em] w-[1.2em] relative">
			<svelte:component this={Flag[iso]} size="100%" />
		</div>
	{/if}
	<div class="text">{value.title}</div>
</div>
