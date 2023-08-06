<script lang="ts">
	import { page } from '$app/stores'
	import Carousel from '$lib/components/preview/Carousel.svelte'
	import EventMeta from '$lib/components/preview/EventMeta.svelte'
	import EventSection from '$lib/components/preview/EventSection.svelte'
	import MarkButton from '$lib/components/preview/MarkButton.svelte'
	import PrimaryCard from '$lib/components/preview/PrimaryCard.svelte'
	import SecondaryCard from '$lib/components/preview/SecondaryCard.svelte'
	import Skeleton from '$lib/components/skeletons/Skeleton.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import * as Flag from 'svelte-flag-icons'
	// Icons
	import MainButton from '$lib/components/preview/MainButton.svelte'
	import Icon from 'svelte-icons-pack'
	import CgAdd from 'svelte-icons-pack/cg/CgAdd'
	import FiCopy from 'svelte-icons-pack/fi/FiCopy'

	let events: any = null
	let loading: boolean = true
	let primarySpeakers: any[] = []
	let secondarySpeakers: any[] = []
	let id: string = $page.params.id
	let isMobile = false

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

<section
	class="@container bg-black min-h-screen w-[calc(100%-1rem)] {isMobile &&
		'max-w-sm'} background rounded-t-xl scrollbar-hide relative"
>
	<div class="w-fit h-fit flex absolute top-10 right-10 z-20">
		<button
			class="w-14 h-14 bg-gd-main p-[1px] rounded-l-sm"
			on:click={() => {
				isMobile = false
			}}
		>
			<div
				class="w-full h-full flex justify-center items-center p-3 rounded-l-sm {!isMobile
					? 'bg-transparent'
					: 'bg-black'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="50"
					height="51"
					viewBox="0 0 90 91"
					fill="none"
				>
					<path
						d="M31.7091 83.2373V75.3712H39.5752V67.5051H15.9769C13.8138 67.5051 11.9626 66.7355 10.4235 65.1964C8.88172 63.6546 8.11084 61.8022 8.11084 59.639V20.3085C8.11084 18.1453 8.88172 16.2928 10.4235 14.7511C11.9626 13.2119 13.8138 12.4424 15.9769 12.4424H78.9058C81.0689 12.4424 82.9214 13.2119 84.4632 14.7511C86.0023 16.2928 86.7719 18.1453 86.7719 20.3085V59.639C86.7719 61.8022 86.0023 63.6546 84.4632 65.1964C82.9214 66.7355 81.0689 67.5051 78.9058 67.5051H55.3074V75.3712H63.1736V83.2373H31.7091ZM15.9769 59.639H78.9058V20.3085H15.9769V59.639Z"
						fill="white"
					/>
				</svg>
			</div>
		</button>
		<button
			class="w-14 h-14 bg-gd-main p-[1px] rounded-r-sm"
			on:click={() => {
				isMobile = true
			}}
		>
			<div
				class="w-full h-full flex justify-center items-center p-3 rounded-r-sm {isMobile
					? 'bg-transparent'
					: 'bg-black'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="51"
					height="51"
					viewBox="0 0 90 90"
					fill="none"
				>
					<path
						d="M64.1483 87.4565H29.3644C27.0581 87.4565 24.8463 86.5404 23.2154 84.9096C21.5846 83.2787 20.6685 81.0669 20.6685 78.7606V14.9902C20.6685 12.6839 21.5846 10.472 23.2154 8.84119C24.8463 7.21037 27.0581 6.2942 29.3644 6.2942H64.1483C66.4546 6.2942 68.6665 7.21037 70.2973 8.84119C71.9281 10.472 72.8442 12.6839 72.8442 14.9902V78.7606C72.8442 81.0669 71.9281 83.2787 70.2973 84.9096C68.6665 86.5404 66.4546 87.4565 64.1483 87.4565ZM67.0469 14.9902C67.0469 14.2214 66.7416 13.4841 66.1979 12.9405C65.6543 12.3969 64.9171 12.0915 64.1483 12.0915H29.3644C28.5957 12.0915 27.8584 12.3969 27.3148 12.9405C26.7712 13.4841 26.4658 14.2214 26.4658 14.9902V78.7606C26.4658 79.5293 26.7712 80.2666 27.3148 80.8102C27.8584 81.3538 28.5957 81.6592 29.3644 81.6592H64.1483C64.9171 81.6592 65.6543 81.3538 66.1979 80.8102C66.7416 80.2666 67.0469 79.5293 67.0469 78.7606V14.9902ZM61.2496 72.9633C61.2496 72.1945 60.9442 71.4572 60.4006 70.9136C59.857 70.37 59.1197 70.0646 58.351 70.0646H35.1617C34.393 70.0646 33.6557 70.37 33.1121 70.9136C32.5685 71.4572 32.2631 72.1945 32.2631 72.9633C32.2631 73.732 32.5685 74.4693 33.1121 75.0129C33.6557 75.5565 34.393 75.8619 35.1617 75.8619H58.351C59.1197 75.8619 59.857 75.5565 60.4006 75.0129C60.9442 74.4693 61.2496 73.732 61.2496 72.9633Z"
						fill="white"
					/>
				</svg>
			</div>
		</button>
	</div>
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
			<MainButton title="Edit" href={`/events/edit/${id}`} />
			<MainButton title="Close preview" href="/" />
		</div>
	</div>
</section>

<style>
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
