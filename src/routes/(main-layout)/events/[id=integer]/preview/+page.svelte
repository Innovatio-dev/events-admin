<script lang="ts">
	//Utils
	import { pageAlert, pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import * as Flag from 'svelte-flag-icons'
	import { page } from '$app/stores'
	//Components
	import Carousel from '$lib/components/preview/Carousel.svelte'
	import EventMeta from '$lib/components/preview/EventMeta.svelte'
	import EventSection from '$lib/components/preview/EventSection.svelte'
	import MarkButton from '$lib/components/preview/MarkButton.svelte'
	import PrimaryCard from '$lib/components/preview/PrimaryCard.svelte'
	import SecondaryCard from '$lib/components/preview/SecondaryCard.svelte'
	import Skeleton from '$lib/components/skeletons/Skeleton.svelte'
	import VenueCard from '$lib/components/preview/VenueCard.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'
	// Icons
	import MainButton from '$lib/components/preview/MainButton.svelte'
	import Icon from 'svelte-icons-pack'
	import CgAdd from 'svelte-icons-pack/cg/CgAdd'
	import FiCopy from 'svelte-icons-pack/fi/FiCopy'
	//Props
	let events: any = null
	let loading: boolean = true
	let primarySpeakers: any[] = []
	let secondarySpeakers: any[] = []
	let id: string = $page.params.id
	let isMobile = false
	let typeTitle: string = ''
	let typeEvent
	// Modal
	let isOpen = false
	let isOpenDraft = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleOpenDraftModal = () => {
		isOpenDraft = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}
	const handleCloseDraftModal = () => {
		isOpenDraft = false
	}
	async function handleConfirm() {
		await changeStatus(1)
		handleCloseModal()
	}
	async function handleConfirmDraft() {
		await changeStatus(2)
		handleCloseModal()
	}

	onMount(async () => {
		let id = $page.params.id
		await fetchEvents(id)
	})

	async function fetchEvents(id) {
		loading = true
		let response = await fetch(`/api/events/${id}`)
		if (response.ok) {
			events = await response.json()
			//Change TypeEvent section
			typeEvent = events.typeEvent
			typeTitle = typeEvent === 1 ? 'Venue' : 'Join our Zoom'
			//Filter speakers
			primarySpeakers = events.eventSpeakers.filter((speaker) => speaker.primary)
			secondarySpeakers = events.eventSpeakers.filter((speaker) => !speaker.primary)
			$pageStatus.title = events.title
		}
		loading = false
	}

	const changeStatus = async (publishStatus) => {
		try {
			const response = await fetch(`/api/events/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ status: publishStatus, reason: '', publishingUpdate: true })
			})
			if (response.ok) {
				events.status = publishStatus
				if (publishStatus == 1) {
					$pageAlert = {
						message: publishStatus && 'Event Published',
						status: true
					}
				} else if (publishStatus == 2) {
					$pageAlert = {
						message: publishStatus && 'Event saved as draft',
						status: true
					}
				}
			} else {
				console.log(await response.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error de red:', error)
		}
	}

	function capText(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
	}

	function goBack() {
		history.back()
	}
</script>

<div class="flex items-center justify-center mx-auto w-full py-6">
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
				{:else if events?.banner}
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
								{@html events.description ?? '---'}
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
					{#if typeEvent === 0}
						<!-- Language -->
						<EventSection title={'Language'}>
							{#if loading}
								<div class="flex flex-col gap-y-4">
									<Skeleton wFull height={200} />
									<Skeleton wFull height={120} />
								</div>
							{:else if events.language}
								<div
									class="flex flex-col @lg:flex-row @lg:items-center gap-y-4 gap-x-12"
								>
									<div>
										<div>
											<p>Primary Language</p>
										</div>
										{#if events.language}
											<div
												class="flex gap-x-2 w-fit items-center bg-black py-4 px-4 text-white rounded-md"
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
											<div
												class="flex flex-wrap items-start justify-start gap-y-6 gap-x-4 pt-2"
											>
												{#each events.translation as translation}
													<div
														class="flex gap-x-2 items-center bg-black py-2 px-4 text-white rounded-md"
													>
														<svelte:component
															this={Flag[
																capText(translation.flagIso)
															]}
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
					{/if}
					<div>
						<EventSection title={typeTitle}>
							{#if typeEvent == 1}
								<VenueCard
									image={events.venue.pictures[0]?.url}
									title={events.venue.name}
									content={events.venue.description}
									continent={events.venue.region.name}
									country={events.venue.country.nicename}
									city={events.venue.city}
									location={events.venue.city}
								/>
							{/if}
							{#if loading}
								<div class="flex flex-col gap-y-4 w-[115%] -ml-[9%]">
									<Skeleton wFull height={700} />
								</div>
							{:else if events}
								<div
									class="flex flex-col justify-between bg-black w-[115%] h-fit relative -ml-[9%]"
								>
									{#if events.typeEvent}
										<div
											class="flex items-center justify-start gap-x-4 px-6 py-4 h-fit"
										>
											<div class="flex items-center justify-center gap-x-2">
												<Icon src={CgAdd} size={'2rem'} />
												<div>invite</div>
											</div>
											{#if events.linkZoom}
												<div
													class="flex items-center bg-brand-gray border-[1px] border-neutral-4 py-2 px-4 rounded-lg h-[40px]"
												>
													<a
														href={events.linkZoom}
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
											{/if}
										</div>
									{/if}
									{#if events.pictures}
										<div class="w-full h-fit @lg:h-[600px] overflow-hidden">
											<Carousel images={events.pictures} />
										</div>
									{/if}
									<div
										class="flex items-center justify-center w-full mx-auto py-6"
									>
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
				<MainButton title="Publish Event" handleClick={handleOpenModal} />
				<MainButton title="Edit" href={`/events/${id}/edit`} />
				<MainButton title="Close preview" handleClick={goBack} />
			</div>
		</div>
	</section>
</div>
<div class="w-full fixed max-h-screen z-50 px-16">
	<Modal isOpen={isOpenDraft} handleClose={handleCloseDraftModal}>
		<ApprovedModal
			text="Are you sure you would like to save as draft this event?"
			onConfirm={handleConfirmDraft}
			onCancel={handleCloseDraftModal}
		/>
	</Modal>
	<Modal {isOpen} handleClose={handleCloseModal}>
		<ApprovedModal
			text="Are you sure you would like to publish this event?"
			onConfirm={handleConfirm}
			onCancel={handleCloseModal}
		/>
	</Modal>
</div>

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
