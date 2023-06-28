<script lang="ts">
	export let value: string
</script>

<div class="w-full overflow-hidden text-ellipsis text-center">
	<a href={`mailto: ${value}`}>{value}</a>
</div>
