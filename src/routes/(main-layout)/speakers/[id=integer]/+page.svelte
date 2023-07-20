<script lang="ts">
	// Common
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { goto } from '$app/navigation'
	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import ProfilePic from '$lib/components/ProfilePic.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	// Icon
	import Icon from 'svelte-icons-pack/Icon.svelte'
	import BiEditAlt from 'svelte-icons-pack/bi/BiEditAlt'
	import BsTrash3 from 'svelte-icons-pack/bs/BsTrash3'

	let speaker: any = null
	let loading: boolean = true

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}

	const removeSpeaker = async () => {
		await deleteSpeaker(speaker.id)
		goto('/speakers')
	}

	async function deleteSpeaker(id) {
		loading = true
		try {
			const res = await fetch(`/api/speakers/${id}`, {
				method: 'DELETE'
			})
			if (res.ok) {
				const data = await res.json()
				// console.log(data)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
	}

	async function fetchSpeaker(id) {
		loading = true
		try {
			const res = await fetch(`/api/speakers/${id}`)
			if (res.ok) {
				speaker = await res.json()
				// console.log(speaker)
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
		loading = false
	}

	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Speaker Details'
		await fetchSpeaker(id)
	})
</script>

<div class="flex flex-col w-[400px] px-10 h-fit gap-y-10">
	<div class="grid grid-cols-2 min-w-[400px] mb-8">
		<div class="field">
			<p>Organizer name:</p>
			<p>Country:</p>
			<p>Speaker company:</p>
			<p>Role / position:</p>
			<p>Twitter:</p>
			<p>Instagram:</p>
			<p>LinkedIn:</p>
			<p>Facebook:</p>
			<p>Youtube:</p>
			<p>Description:</p>
		</div>
		{#if loading}
			<div class="w-full h-full flex">
				<SimpleSkeleton width={200} height={20} items={8} />
			</div>
		{:else if speaker}
			<div class="content">
				<p>{speaker.name ?? '-'}</p>
				<p>{speaker.country?.nicename ?? '-'}</p>
				<p>{speaker.company ?? '-'}</p>
				<p>{speaker.jobRole ?? '-'}</p>
				<p>{speaker.twitter?.substring(speaker.twitter.lastIndexOf('/') + 1) ?? '-'}</p>
				<p>{speaker.instagram?.substring(speaker.instagram.lastIndexOf('/') + 1) ?? '-'}</p>
				<p>{speaker.linkedin?.substring(speaker.linkedin.lastIndexOf('/') + 1) ?? '-'}</p>
				<p>{speaker.facebook?.substring(speaker.facebook.lastIndexOf('/') + 1) ?? '-'}</p>
				<p>{speaker.youtube?.substring(speaker.youtube.lastIndexOf('/') + 1) ?? '-'}</p>
				<p>{speaker.description ?? '-'}</p>
			</div>
		{/if}
	</div>
	<div class="w-[10rem] h-[10rem]">
		<ProfilePic img={speaker?.picture?.url} />
	</div>
	<div class="flex gap-10 mb-10">
		<MainButton on:click={() => goto(`${$page.url}/edit`)}>
			<div class="flex gap-3 items-center">
				<Icon size="20" src={BiEditAlt} color="gray" />
				{'Edit'}
			</div>
		</MainButton>
		<MainButton on:click={handleOpenModal}>
			<div class="flex gap-3 items-center">
				<Icon size="20" src={BsTrash3} color="gray" />
				{'Remove'}
			</div>
		</MainButton>
		<svelte:component this={Modal} {isOpen} handleClose={handleCloseModal} title="">
			<div class="px-12 py-3 flex justify-center flex-col gap-10">
				<span class="text-neutral-4 font-light font-eesti">
					{'Do you really want to remove this speaker?'}
				</span>
				<div class="flex w-[90%] gap-5 mx-auto items-center justify-center">
					<div class="w-20">
						<MainButton on:click={removeSpeaker}>
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
		</svelte:component>
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
