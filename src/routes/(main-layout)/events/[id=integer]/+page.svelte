<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus } from '$lib/stores/pageStatus'
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import Icon from 'svelte-icons-pack'
	import BiLogoFacebookCircle from 'svelte-icons-pack/bi/BiLogoFacebookCircle'
	import BiLogoInstagramAlt from 'svelte-icons-pack/bi/BiLogoInstagramAlt'
	import BiLogoTwitter from 'svelte-icons-pack/bi/BiLogoTwitter'
	import AiFillLinkedin from 'svelte-icons-pack/ai/AiFillLinkedin'
	import FiYoutube from 'svelte-icons-pack/fi/FiYoutube'

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
				}
			}
			$pageStatus.title = events.title
		}
		loading = false
	}
</script>

<div class="w-1/2 p-6">
	<!-- Event -->
	<div>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Status:</p>
				<p>Event ID:</p>
				<p>Date published:</p>
				<p>Date of suspension:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={4} />
				</div>
			{:else if events.venue}
				<div class="content">
					<p>{events.status ?? '---'}</p>
					<p>{events.id ?? '---'}</p>
					<p>{events.venue.country.name ?? '---'}</p>
					<p>{events.venue.addres ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Organizer Details -->
	<div>
		<h2>Organizer Details</h2>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Organizer full name:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={1} />
				</div>
			{:else if events.venue}
				<div class="content">
					<p>{events.organizer.name ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Event Information -->
	<div>
		<h2>Event Information</h2>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Type Event:</p>
				<p>Featured/Regular:</p>
				<p>Event Title:</p>
				<p>Description:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={4} />
				</div>
			{:else if events.venue}
				<div class="content">
					<p>{events.typeEvent ?? '---'}</p>
					<p>{events.isFeatured ?? '---'}</p>
					<p>{events.title ?? '---'}</p>
					<p>{events.description ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Location, date & time of the event -->
	<div>
		<h2>Location, date & time of the event</h2>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Location:</p>
				<p>Country:</p>
				<p>City:</p>
				<p>Event Photo:</p>
				<p>Pin Photo:</p>
				<p>Date Starts:</p>
				<p>Date Ends:</p>
				<p>Time Starts:</p>
				<p>Time zone:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={8} />
				</div>
			{:else if events.venue}
				<div class="content">
					<p>{events.venue.region.name ?? '---'}</p>
					<p>{events.venue.country.nicename ?? '---'}</p>
					<p>{events.venue.city ?? '---'}</p>
					<p>{events.photo ?? '---'}</p>
					<p>{events.pin ?? '---'}</p>
					<p>{events.schedule.startTime ?? '---'}</p>
					<p>{events.schedule.endTime ?? '---'}</p>
					<p>{events.schedule.startTime ?? '---'}</p>
					<p>{events.schedule.timeZone ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Speakers -->
	<div>
		<h2>Speakers</h2>
		{#each primarySpeakers as speaker}
			<div class="grid grid-cols-2 min-w-[400px] mb-8">
				<div class="field">
					<p>Primary Speaker:</p>
				</div>
				{#if loading}
					<div class="w-full h-full flex">
						<SimpleSkeleton width={200} height={20} items={1} />
					</div>
				{:else if events}
					<div class="flex content">
						<p class="!w-fit pr-4">{speaker.name}</p>
						<div class=" flex items-center justify-center gap-x-2 my-auto !p-0">
							{#if speaker.facebook}
								<a
									href={`https://www.facebook.com/${speaker.facebook}`}
									class="text-black"
								>
									<Icon src={BiLogoFacebookCircle} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.instagram}
								<a
									href={`https://www.instagram.com/${speaker.instagram}`}
									class="text-black"
								>
									<Icon src={BiLogoInstagramAlt} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.twitter}
								<a
									href={`https://www.twitter.com/${speaker.twitter}`}
									class="text-black"
								>
									<Icon src={BiLogoTwitter} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.linkedin}
								<a
									href={`https://www.linkedin.com/${speaker.linkedin}`}
									class="text-black"
								>
									<Icon src={AiFillLinkedin} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.youtube}
								<a
									href={`https://www.youtube.com/${speaker.youtube}`}
									class="text-black"
								>
									<Icon src={FiYoutube} className="w-6 h-6" />
								</a>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
		{#each secondarySpeakers as speaker}
			<div class="grid grid-cols-2 min-w-[400px] mb-8">
				<div class="field">
					<p>Secondary Speaker:</p>
				</div>
				{#if loading}
					<div class="w-full h-full flex">
						<SimpleSkeleton width={200} height={20} items={1} />
					</div>
				{:else if events}
					<div class="flex content">
						<p class="!w-fit pr-4">{speaker.name}</p>
						<div class=" flex items-center justify-center gap-x-2 my-auto !p-0">
							{#if speaker.facebook}
								<a
									href={`https://www.facebook.com/${speaker.facebook}`}
									class="text-black"
								>
									<Icon src={BiLogoFacebookCircle} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.instagram}
								<a
									href={`https://www.instagram.com/${speaker.instagram}`}
									class="text-black"
								>
									<Icon src={BiLogoInstagramAlt} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.twitter}
								<a
									href={`https://www.twitter.com/${speaker.twitter}`}
									class="text-black"
								>
									<Icon src={BiLogoTwitter} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.linkedin}
								<a
									href={`https://www.linkedin.com/${speaker.linkedin}`}
									class="text-black"
								>
									<Icon src={AiFillLinkedin} className="w-6 h-6" />
								</a>
							{/if}
							{#if speaker.youtube}
								<a
									href={`https://www.youtube.com/${speaker.youtube}`}
									class="text-black"
								>
									<Icon src={FiYoutube} className="w-6 h-6" />
								</a>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<!-- Venues -->
	<div>
		<h2>Venue</h2>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Venue Name:</p>
				<p>Venue Country</p>
				<p>Venue address:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={3} />
				</div>
			{:else if events.venue}
				<div class="content">
					<p>{events.venue.name ?? '---'}</p>
					<p>{events.venue.country.name ?? '---'}</p>
					<p>{events.venue.addres ?? '---'}</p>
				</div>
			{/if}
		</div>
		<div class="flex !max-w-[300px] mb-8">
			<div class="field">
				<p>Photo:</p>
			</div>
			{#if loading}
				<div class="w-full h-fit flex">
					<SimpleSkeleton width={280} height={180} items={1} />
				</div>
			{:else if events}
				<div class="min-w-[280px] min-h-[160px] flex">
					<img
						src={events.venue.pictures[0].url}
						alt={events.venue.pictures[0].name}
						class="rounded-lg"
					/>
				</div>
			{/if}
		</div>
		<div class="flex !max-w-[280px] mb-8">
			<div class="field">
				<p>Aditional photo:</p>
			</div>
			{#if loading}
				<div class="min-w-[280px] min-h-[160px] flex gap-x-12">
					<SimpleSkeleton wFull height={180} items={1} />
				</div>
			{:else if events}
				<div class="flex gap-x-12 w-full">
					{#each events.pictures as picture, index}
						<div class="min-w-[280px] min-h-[160px]">
							<img src={picture.url} alt={picture.name} class="rounded-lg" />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	h2 {
		@apply text-neutral-3 font-eesti text-[30px] capitalize font-normal;
	}
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-2;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
