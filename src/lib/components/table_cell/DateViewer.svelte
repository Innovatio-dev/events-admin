<script lang="ts">
	export let value: string | null
	$: formattedDate = value
		? new Date(value).toLocaleString('default', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
		  })
		: 'Empty Date'
</script>

<div class="h-full w-full flex items-center">
	<div class="w-full text-center text-ellipsis overflow-hidden">
		{formattedDate}
	</div>
</div>
