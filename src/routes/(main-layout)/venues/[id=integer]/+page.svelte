<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { goto } from '$app/navigation'

	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import VenueForm from '$lib/components/custom/VenueForm.svelte'

	let venue: any = null
	let loading: boolean = true

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}

	// Create Modal
	let isCreateOpen = false
	const handleCreateOpenModal = () => {
		isCreateOpen = true
	}
	const handleCreateCloseModal = () => {
		isCreateOpen = false
	}

	const removeVenue = async () => {
		await deleteVenue(venue.id)
		goto('/venues')
	}
	async function deleteVenue(id) {
		loading = true
		try {
			const res = await fetch(`/api/venues/${id}`, {
				method: 'DELETE'
			})
			if (res.ok) {
				const data = await res.json()
				console.log(data)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
	}

	async function fetchVenue(id) {
		loading = true
		let response = await fetch(`/api/venues/${id}`)
		if (response.ok) {
			venue = await response.json()
			$pageStatus.title = venue.name
		}
		loading = false
	}

	async function postVenue(venue) {
		try {
			const res = await fetch(`${$page.url.origin}/api/venues`, {
				method: 'POST',
				body: JSON.stringify({ ...venue })
			})

			if (res.ok) {
				const data = await res.json()
				console.log(data)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
	}


	function gMapsLink(lat, lng) {
		const enlace = `http://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=17`
		return enlace
	}

	onMount(async () => {
		let id = $page.params.id
		await fetchVenue(id)
	})
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
				<p>{venue.region?.name ?? '---'}</p>
				<p>{venue.country?.name ?? '---'}</p>
				<p>{venue.city ?? '---'}</p>
				<p>{venue.address ?? '---'}</p>
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
				<img
					src={venue.pictures[0]?.url ?? ''}
					alt={venue.pictures[0]?.name ?? ''}
					class="rounded-lg"
				/>
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
	<div class="flex flex-row gap-6">
		<div class="w-fit">
			<MainButton href={`/venues/${$page.params.id}/edit`}>
				{'Edit'}
			</MainButton>
		</div>
		<div class="w-fit">
			<MainButton on:click={handleOpenModal}>
				{'Remove'}
			</MainButton>
		</div>
		<div class="w-fit">
			<MainButton on:click={handleCreateOpenModal}>
				<div class="flex gap-3 items-center justify-center w-28">
					{'Create Modal'}
				</div>
			</MainButton>
		</div>
	</div>
	<Modal {isOpen} handleClose={handleCloseModal}>
		<div class="px-12 py-3 flex justify-center flex-col gap-10">
			<span class="text-neutral-4 font-light font-eesti">
				{'Do you really want to remove this venue?'}
			</span>
			<div class="flex w-[90%] gap-5 mx-auto items-center justify-center">
				<div class="w-20">
					<MainButton on:click={removeVenue}>
						<span class="font-light font-eesti text-sm">
							{'Yes'}
						</span>
					</MainButton>
				</div>
				<div class="w-20">
					<MainButton on:click={handleCloseModal}>
						<span class="font-light font-eesti text-sm">
							{'Cancel'}
						</span>
					</MainButton>
				</div>
			</div>
		</div>
	</Modal>
	<Modal isOpen={isCreateOpen} handleClose={handleCreateCloseModal}>
		<div class="flex flex-col items-center gap-5 py-5 px-12">
			<span class="pb-5">
				{'Create the venue profile inside the event creation'}
			</span>
			<VenueForm submitAction={postVenue} />
		</div>
	</Modal>
</div>

<style lang="postcss">
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-2;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
