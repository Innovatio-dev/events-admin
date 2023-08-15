<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	import { goto } from '$app/navigation'
	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	// Icons
	import Icon from 'svelte-icons-pack'
	import BiEditAlt from 'svelte-icons-pack/bi/BiEditAlt'
	import BsTrash3 from 'svelte-icons-pack/bs/BsTrash3'

	// State
	let venue: any = null
	let loading = true
	let fetchLoading = false

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}

	const removeVenue = async () => {
		await deleteVenue(venue.id)
		goto('/venues')
	}
	async function deleteVenue(id) {
		fetchLoading = true
		try {
			const res = await fetch(`/api/venues/${id}`, {
				method: 'DELETE'
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Venue deleted', status: true }
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = {
				message: 'Oops! An error has occurred. try again later.',
				status: false
			}
		}
		fetchLoading = false
	}

	async function fetchVenue(id) {
		loading = true
		try {
			let res = await fetch(`/api/venues/${id}`)
			if (res.ok) {
				venue = await res.json()
				$pageStatus.title = venue.name
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
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
				<p class="!h-fit">{@html venue.description.toString() ?? '---'}</p>
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
			<p>Additional photo:</p>
		</div>
		{#if loading}
			<div class="min-w-[280px] min-h-[160px] flex gap-x-12">
				<SimpleSkeleton wFull height={180} items={1} />
			</div>
		{:else if venue.pictures}
			{#if venue.pictures.length > 1}
				<div class="min-w-[280px] min-h-[160px] flex gap-x-12">
					{#each venue.pictures as picture, index}
						<img src={picture.url} alt={picture.name} class="rounded-lg" />
					{/each}
				</div>
			{:else if venue.pictures}
				<div class="flex justify-center items-center min-w-[400px] text-neutral-3">
					<p>This venue doesn't have any additional photos</p>
				</div>
			{/if}
		{/if}
	</div>
	<div class="flex flex-row gap-6">
		<div class="w-fit">
			<MainButton href={`/venues/${$page.params.id}/edit`}>
				<Icon size="20" src={BiEditAlt} />
				{'Edit'}
			</MainButton>
		</div>
		<div class="w-fit">
			<MainButton on:click={handleOpenModal}>
				<Icon size="20" src={BsTrash3} />
				{'Remove'}
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
					<MainButton loading={fetchLoading} on:click={removeVenue}>
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
</div>

<style lang="postcss">
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-2;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti h-[40px] min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
