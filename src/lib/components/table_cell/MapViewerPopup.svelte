<script lang="ts">
	import Popup from '../Popup.svelte'
	import MapViewer from '../MapViewer.svelte'
	export let value
	let anchor
	let popup
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
	on:click={popup.show()}
	bind:this={anchor}
	href="#"
	class="w-full h-full flex items-center justify-center"
>
	See Location
</a>
<Popup trigger={anchor} bind:this={popup} desiredWidth={'400px'}>
	<div class="map-container">
		<MapViewer latitude={value.latitude} longitude={value.longitude} title={value.title} />
	</div>
</Popup>

<style lang="scss">
	.map-container {
		width: 100%;
	}
</style>
