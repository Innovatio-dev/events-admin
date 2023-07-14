<script lang="ts">
	export let value: any
</script>

<div class="w-full overflow-hidden text-ellipsis text-center underline">
	<a target="_blank" href={`${value?.url}`}>Photo</a>
</div>
