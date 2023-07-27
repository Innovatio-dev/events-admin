<script lang="ts">
	export let value: any
	import * as Flag from 'svelte-flag-icons'
	$: padding = value?.padding ?? '0.5rem'
	$: align = value?.align ?? 'center'
	$: iso = value ? value.iso.charAt(0).toUpperCase() + value.iso.slice(1).toLowerCase() : null
</script>

<div
	class={`w-full h-full flex gap-2 items-center`}
	style={`justify-content: ${align}; padding: ${padding}`}
>
	{#if iso}
		<div class="min-w-[1.2em] w-[1.2em] relative">
			<svelte:component this={Flag[iso]} size="100%" />
		</div>
		<span class="overflow-hidden text-ellipsis whitespace-nowrap capitalize"
			>{value.nicename}</span
		>
	{/if}
</div>
