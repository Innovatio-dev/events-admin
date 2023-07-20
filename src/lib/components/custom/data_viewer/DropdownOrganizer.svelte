<script lang="ts">
	import TextWithImageViewer from './TextWithImageViewer.svelte'
	export let value: any
	let formattedValue
	$: {
		formattedValue = { title: value.name, image: value.logo?.url }
	}
</script>

<TextWithImageViewer value={formattedValue} />
