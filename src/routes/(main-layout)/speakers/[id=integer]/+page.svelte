<script lang="ts">
	// Common
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import ProfilePic from '$lib/components/ProfilePic.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
    // Icon
	import Icon from 'svelte-icons-pack/Icon.svelte'
    import BiEditAlt from "svelte-icons-pack/bi/BiEditAlt";
    import BsTrash3 from "svelte-icons-pack/bs/BsTrash3";


	let speaker: any = null
	let loading: boolean = true
	onMount(async () => {
		let id = $page.params.id
		$pageStatus.title = 'Speakers Details'
		await fetchSpeaker(id)
	})

	async function fetchSpeaker(id) {
		loading = true
		let response = await fetch(`/api/speakers/${id}`)
		if (response.ok) {
			speaker = await response.json()
		}
		loading = false
	}
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
				<p>{speaker.country.nicename ?? '-'}</p>
				<p>{speaker.company ?? '-'}</p>
				<p>{speaker.jobRole ?? '-'}</p>
				<p>{speaker.twitter ?? '-'}</p>
				<p>{speaker.instagram ?? '-'}</p>
				<p>{speaker.linkedin ?? '-'}</p>
				<p>{speaker.facebook ?? '-'}</p>
				<p>{speaker.youtube ?? '-'}</p>
				<p>{speaker.description ?? '-'}</p>
			</div>
		{/if}
	</div>
	<div class="w-[10rem] h-[10rem]">
		<ProfilePic img={speaker?.picture.url} />
	</div>
	<div class='flex gap-10'>
		<MainButton>
			<div class="flex gap-3 items-center">
				<Icon size="20" src={BiEditAlt} color="gray" />
				{'Edit'}
			</div>
		</MainButton>
		<MainButton>
			<div class="flex gap-3 items-center">
				<Icon size="20" src={BsTrash3} color="gray" />
				{'Remove'}
			</div>
		</MainButton>
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
