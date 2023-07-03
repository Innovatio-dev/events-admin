<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'

	let venue: any = null
	let loading: boolean = true

	onMount(async () => {
		let id = $page.params.id
		await fetchVenue(id)
	})

	async function fetchVenue(id) {
		loading = true
		let response = await fetch(`/api/venues/${id}`)
		if (response.ok) {
			venue = await response.json()
			$pageStatus.title = venue.name
		}
		loading = false
	}

	function gMapsLink(lat, lng) {
		const enlace = `http://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=17`
		return enlace
	}
</script>

<div class="w-1/2 p-6">
	<div class="grid grid-cols-2 min-w-[400px] mb-8">
		<div class="field">
			<p>Venue name:</p>
			<p>Venue Location:</p>
			<p>Venue Country</p>
			<p>Venue city:</p>
			<p>Venue address:</p>
			<p>Google maps:</p>
			<p>Description</p>
		</div>
		{#if loading}
			<div class="w-full h-full flex">
				<SimpleSkeleton width={200} height={20} items={8} />
			</div>
		{:else if venue}
			<div class="content">
				<p>{venue.name ?? '---'}</p>
				<p>{venue.region.name ?? '---'}</p>
				<p>{venue.country.name ?? '---'}</p>
				<p>{venue.city ?? '---'}</p>
				<p>{venue.addres ?? '---'}</p>
				<a href={gMapsLink(venue.location.lat, venue.location.lng)} target="_blank">
					<p>Abrir mapa</p>
				</a>
				<p>{venue.description ?? '---'}</p>
			</div>
		{/if}
	</div>
	<div class="flex !max-w-[300px] mb-8">
		<div class="field">
			<p>Feature photo:</p>
		</div>
		{#if loading}
			<div class="w-full h-fit flex">
				<SimpleSkeleton width={280} height={180} items={1} />
			</div>
		{:else if venue}
			<div class="min-w-[280px] min-h-[160px] flex">
				<img src={venue.pictures[0].url} alt={venue.pictures[0].name} class="rounded-lg" />
			</div>
		{/if}
	</div>
	<div class="flex !max-w-[280px] mb-8">
		<div class="field">
			<p>Feature photo:</p>
		</div>
		{#if loading}
			<div class="min-w-[280px] min-h-[160px] flex gap-x-12">
				<SimpleSkeleton wFull height={180} items={1} />
			</div>
		{:else if venue}
			<div class="min-w-[280px] min-h-[160px] flex gap-x-12">
				{#each venue.pictures as picture, index}
					<img src={picture.url} alt={picture.name} class="rounded-lg" />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-2;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
