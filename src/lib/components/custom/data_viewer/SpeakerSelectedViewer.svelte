<script lang="ts">
	import SimpleTextViewer from './SimpleTextViewer.svelte'
	export let value: any
	let formattedValue
	$: {
		formattedValue = { title: value.name }
	}
</script>

<SimpleTextViewer value={formattedValue} />
