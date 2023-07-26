<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { onDestroy } from 'svelte'
	import 'leaflet/dist/leaflet.css'
	export let latitude: number
	export let longitude: number
	export let title: string = ''
	let map: any
	let mapContainer: HTMLDivElement
	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet')

			map = leaflet.map(mapContainer).setView([latitude, longitude], 10)

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				})
				.addTo(map)

			leaflet.marker([latitude, longitude]).addTo(map).bindPopup(title).openPopup()
		}
	})
	onDestroy(() => {
		if (map) {
			map.remove()
		}
	})
</script>

<div class="map-container" bind:this={mapContainer} />

<style lang="scss">
	.map-container {
		height: 400px;
		width: 400px;
	}
</style>
