<script lang="ts">
	export let value: any
</script>

<div class="w-full h-full flex gap-2 items-center justify-center p-2">
	<span class="overflow-hidden text-ellipsis whitespace-nowrap capitalize"
		>{value?.name ?? ''}</span
	>
</div>
