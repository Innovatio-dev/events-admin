<script lang="ts">
	export let value: boolean
</script>

<div class="w-full h-full flex items-center justify-center gap-2">
	{#if !value}
		<div class="flex items-center justify-center gap-x-2">
			<span class="w-4 h-4 bg-neutral-2 rounded-full" />
			<span> Regular </span>
		</div>
	{:else}
		<div class="flex items-center justify-center gap-x-2">
			<span class="w-4 h-4 bg-primary-purple rounded-full" />
			<span class="text-primary-purple"> Featured </span>
		</div>
	{/if}
</div>
