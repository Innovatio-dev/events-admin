<script lang="ts">
	import EventMeta from '$lib/components/preview/EventMeta.svelte'
	import EventSection from '$lib/components/preview/EventSection.svelte'
	import PrimaryCard from '$lib/components/preview/PrimaryCard.svelte'
	import SecondaryCard from '$lib/components/preview/SecondaryCard.svelte'
	import Skeleton from '$lib/components/skeletons/Skeleton.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import MarkButton from '$lib/components/preview/MarkButton.svelte'
	import Carousel from '$lib/components/preview/Carousel.svelte'
	import * as Flag from 'svelte-flag-icons'
	// Icons
	import Icon from 'svelte-icons-pack'
	import FiCopy from 'svelte-icons-pack/fi/FiCopy'
	import CgAdd from 'svelte-icons-pack/cg/CgAdd'
	import MainButton from '$lib/components/preview/MainButton.svelte'

	let events: any = null
	let loading: boolean = true
	let primarySpeakers: any[] = []
	let secondarySpeakers: any[] = []

	onMount(async () => {
		let id = $page.params.id
		await fetchEvents(id)
	})

	async function fetchEvents(id) {
		loading = true
		let response = await fetch(`/api/events/${id}`)
		if (response.ok) {
			events = await response.json()
			for (const speaker of events.eventSpeakers) {
				if (speaker.primary) {
					primarySpeakers.push(speaker)
				} else {
					secondarySpeakers.push(speaker)
					console.log(secondarySpeakers)
				}
			}
			$pageStatus.title = events.title
		}
		loading = false
	}

	function capText(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
	}
</script>

<section class="bg-black min-h-screen w-full background rounded-t-xl scrollbar-hide">
	<div
		class="flex flex-col min-h-full text-white mx-auto py-16 bg-gd-preview"
		style="max-width: 1200px;"
	>
		<div class="w-[90%] mx-auto gap-y-6">
			{#if loading}
				<div>
					<Skeleton wFull height={600} />
				</div>
			{:else if events}
				<div class="w-fiit h-fit mx-auto">
					<img
						src={events.banner.url}
						alt="event info"
						class="w-full relative rounded-2xl mx-auto object-contain"
					/>
				</div>
			{/if}
			<EventMeta {events} {loading} />
			<div class="flex flex-col gap-y-8">
				<EventSection title={'About'}>
					{#if loading}
						<div class=" h-[100px]">
							<Skeleton items={4} wFull height={20} />
						</div>
					{:else if events}
						<p>
							{events.description}
						</p>
					{/if}
				</EventSection>
				<!-- Speakers -->
				<EventSection title={'Speakers'}>
					{#if loading}
						<div class="flex flex-col gap-y-4">
							<Skeleton wFull height={200} />
							<Skeleton wFull height={120} />
						</div>
					{:else if events}
						{#each primarySpeakers as speaker}
							<PrimaryCard item={speaker} />
						{/each}
						{#each secondarySpeakers as speaker}
							<SecondaryCard item={speaker} />
						{/each}
					{/if}
				</EventSection>
				<!-- Language -->
				<EventSection title={'Language'}>
					{#if loading}
						<div class="flex flex-col gap-y-4">
							<Skeleton wFull height={200} />
							<Skeleton wFull height={120} />
						</div>
					{:else if events.language}
						<div class="flex items-center gap-x-12">
							<div>
								<div>
									<p>Primary Language</p>
								</div>
								{#if events.language}
									<div
										class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md"
									>
										<svelte:component
											this={Flag[capText(events.language.flagIso)]}
											size="20"
										/>
										{events.language.name}
									</div>
								{/if}
							</div>
							<div>
								<div>
									<p>Translations</p>
								</div>
								{#if events.translation}
									<div class="flex gap-x-4">
										{#each events.translation as translation}
											<div
												class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md"
											>
												<svelte:component
													this={Flag[capText(translation.flagIso)]}
													size="20"
												/>
												{translation.name}
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<p>No Language specified</p>
					{/if}
				</EventSection>
				<div>
					<EventSection title={'Join our zoom'}>
						{#if loading}
							<div class="flex flex-col gap-y-4 w-[115%] -ml-[9%]">
								<Skeleton wFull height={700} />
							</div>
						{:else if events}
							<div
								class="flex flex-col justify-between bg-black w-[115%] h-fit relative -ml-[9%]"
							>
								<div
									class="flex items-center justify-start gap-x-4 px-6 py-4 h-fit"
								>
									<div class="flex items-center justify-center gap-x-2">
										<Icon src={CgAdd} size={'2rem'} />
										<div>invite</div>
									</div>
									<div
										class="flex items-center bg-brand-gray border-[1px] border-neutral-4 py-2 px-4 rounded-lg h-[40px]"
									>
										<a
											href="www.zoomlink"
											target="_blank"
											class="underline text-brand-cyan text-xs"
										>
											{events.linkZoom}
										</a>
									</div>
									<div
										class="flex items-center justify-center bg-brand-gray border-[1px] border-neutral-4 w-[40px] h-[40px] rounded-lg"
									>
										<Icon src={FiCopy} />
									</div>
								</div>
								<div class="w-full h-[500px] overflow-hidden">
									<Carousel images={events.pictures} />
								</div>
								<div class="flex items-center justify-center w-full mx-auto py-6">
									<MarkButton text="Mark the date" />
								</div>
							</div>
						{/if}
					</EventSection>
				</div>
				<EventSection title={'About the Organizer'}>
					{#if loading}
						<div class="flex flex-col gap-y-4">
							<Skeleton wFull height={200} />
						</div>
					{:else if events}
						<PrimaryCard
							country={events.organizer.country.name}
							flag={events.organizer.country.iso}
							item={events.organizer}
						/>
					{/if}
				</EventSection>
			</div>
		</div>
		<div class="flex items-center justify-center flex-col w-full mx-auto pt-32">
			<MainButton title="Publish Event" href="/" />
			<MainButton title="Save it in draft" href="/" />
			<MainButton title="Edit" href="/" />
			<MainButton title="Close preview" href="/" />
		</div>
	</div>
</section>

<style>
	h1,
	h2,
	h3,
	h4 {
		font-family: var(--font-eesti);
	}

	p,
	span,
	div {
		font-family: var(--font-dm-Sans);
	}
	.background {
		color: #fff;
		background: #111;
		background-image: url('/src/lib/images/main-bg.svg');
		background-size: 100% auto;
		background-repeat: repeat-y;
		scrollbar-width: none;
	}
</style>
