<script lang="ts">
	import Skeleton from '$lib/components/skeletons/Skeleton.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'

	let events: any = null
	let loading: boolean = true
	let primarySpeakers: any[] = []
	let secondarySpeakers: any[] = []

	onMount(async () => {
		await fetchEvents(3)
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
		console.log(events.banner.url)
	}
</script>

<section class="bg-black h-full min-h-screen w-full background rounded-xl scrollbar-hide">
	<div
		class="flex flex-col min-h-full text-white mx-auto py-16 bg-black/10"
		style="max-width: 1200px;"
	>
		<div class="w-[90%] mx-auto">
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
			<div
				class="w-full flex flex-col lg:flex-row justify-between items-center gap-8 bg-[#161718] px-4 py-4 my-6 rounded-lg"
			>
				<div class="w-full lg:w-auto flex md:items-center gap-7">
					<div class="lg:w-[87px] lg:h-[87px]" />
					<div
						class="w-[calc(100%-5.15rem)] lg:w-[calc(100%-6.75rem)] flex justify-between"
					>
						<div class="w-full flex flex-col justify-between gap-4 lg:gap-3">
							{#if loading}
								loading
							{:else if events}
								<span
									class="text-lg md:text-3xl lg:text-4xl font-dm font-semibold leading-none tracking-[0.005em] line-clamp-1"
									title={events.title ?? '---'}
								>
									{events.title ?? '---'}
								</span>
							{/if}
							<div class="flex flex-col md:flex-row justify-between gap-2 lg:gap-4">
								<div
									class="flex items-center gap-2 font-dm text-sm font-light tracking-[0.5px]"
								>
									<span class="w-max">date</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.background {
		color: #fff;
		background: #111;
		background-image: url('/src/lib/images/main-bg.svg');
		background-size: 100% auto;
		background-repeat: repeat-y;
		scrollbar-width: none;
	}
</style>
