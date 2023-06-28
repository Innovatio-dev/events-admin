<script lang="ts">
	export let value: string | null
</script>

<div class="w-full h-full overflow-hidden text-ellipsis justify-center flex items-center p-4">
	<div class="text-center w-full whitespace-nowrap overflow-hidden text-ellipsis">
		{value}
	</div>
</div>
