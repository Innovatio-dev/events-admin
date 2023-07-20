<script lang="ts">
	import TextWithImageViewer from './TextWithImageViewer.svelte'
	export let value: any
	let formattedValue
	$: {
		formattedValue = { title: value.name, image: value.picture?.url }
	}
</script>

<TextWithImageViewer value={formattedValue} />
