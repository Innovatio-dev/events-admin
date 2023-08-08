<script lang="ts">
	// Svelte
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	import { format } from 'date-fns'
	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import Socials from '$lib/components/preview/Socials.svelte'
	import ProfilePic from '$lib/components/ProfilePic.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import * as Flag from 'svelte-flag-icons'
	import SpeakerBadge from '$lib/components/SpeakerBadge.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import SuspendOrganizer from '$lib/components/SuspendOrganizer.svelte'
	// Icons
	import Icon from 'svelte-icons-pack'
	import BiEditAlt from 'svelte-icons-pack/bi/BiEditAlt'
	import IoClose from 'svelte-icons-pack/io/IoClose'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'

	// State
	let events: any = null
	let loading: boolean = true
	let primarySpeakers: any[] = []
	let secondarySpeakers: any[] = []
	let eventPhoto: string

	onMount(async () => {
		let id = $page.params.id
		await fetchEvents(id)
	})

	function gMapsLink(lat, lng) {
		const enlace = `http://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=17`
		return enlace
	}

	function formatDate(date) {
		return format(new Date(date), 'MMM dd, yyyy')
	}

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}

	// Confirmation Modal
	let isOpenConfirmation = false
	const handleOpenConfirmationModal = () => {
		isOpenConfirmation = true
	}
	const handleCloseConfirmationModal = () => {
		isOpenConfirmation = false
	}

	const handleSuspend = async (e) => {
		await suspendEvent(events.id, e.detail.reason)
	}

	const handleUnsuspend = async () => {
		await suspendEvent(events.id, 'empty', 1)
	}

	const options = [{ id: 'option1', label: 'Unable to make this event at the moment.' }]

	function formatTime(dateString) {
		const date = new Date(dateString)
		let hoursValue = date.getHours()
		const minutes = date.getMinutes()
		let ampm = 'AM'
		if (hoursValue > 12) {
			hoursValue -= 12
			ampm = 'PM'
		}
		const hours = hoursValue.toString().padStart(2, '0')
		return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
	}

	function capText(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
	}

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
			eventPhoto = events.venue.pictures[0].url
		}
		loading = false
	}

	const suspendEvent = async (id, suspendReason, action = 3) => {
		try {
			const res = await fetch(`/api/events/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ status: action, reason: suspendReason })
			})
			if (res.ok) {
				const data = await res.json()
				handleCloseModal()
				handleCloseConfirmationModal()
				await fetchEvents($page.params.id)
				console.log(data)
				$pageAlert = {
					message: action ? 'Organizer suspended.' : "Organizer's suspension removed.",
					status: true
				}
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
		}
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
					<p>{events.status === 0 ? 'Inactive ' : 'Active'}</p>
					<p>{events.uid ?? '---'}</p>
					<p>{formatDate(events.createdAt) ?? '---'}</p>
					<p>{formatDate(events.updatedAt) ?? '---'}</p>
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
					<p>{events.typeEvent === 0 ? 'Virtual' : 'Live'}</p>
					<p
						class={`flex items-center gap-x-2 ${
							events.isFeatured ? '!text-primary-purple' : ''
						} `}
					>
						<span
							class={`w-3 h-3 rounded-full  ${
								events.isFeatured ? 'bg-primary-purple' : 'bg-neutral-3'
							}`}
						/>
						{events.isFeatured ? 'Featured' : 'Regular'}
					</p>
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
					{#if events.venue.pictures}
						<div class="text-ellipsis underline">
							<a target="_blank" href={`${eventPhoto}`}> Event Photo </a>
						</div>
					{:else}
						<p>{'---'}</p>
					{/if}
					{#if events.venue.pictures}
						<div class="text-ellipsis underline">
							<a target="_blank" href={`${eventPhoto}`}> Pin Photo </a>
						</div>
					{:else}
						<p>{'---'}</p>
					{/if}
					<p>{formatDate(events.schedule.startTime) ?? '---'}</p>
					<p>{formatDate(events.schedule.endTime) ?? '---'}</p>
					<p>{formatTime(events.schedule.startTime) ?? '---'}</p>
					<p>{events.schedule.timeZone ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Speakers -->
	<div>
		<h2>Speakers</h2>
		{#each primarySpeakers as speaker}
			<div class="flex flex-col my-6">
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
							<Socials {speaker} color={'#000'} />
						</div>
					{/if}
				</div>
				<div class="w-full h-[100px]">
					<SpeakerBadge
						size={'80'}
						image={speaker.picture?.url ?? ''}
						jobRole={speaker.jobRole}
						company={speaker.company}
					/>
				</div>
			</div>
		{/each}
		{#each secondarySpeakers as speaker}
			<div class="flex flex-col my-2">
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
							<Socials {speaker} color={'#000'} />
						</div>
					{/if}
				</div>
				<div class="w-full h-[60px]">
					<SpeakerBadge
						size={'60'}
						image={speaker.picture?.url ?? ''}
						jobRole={speaker.jobRole}
						company={speaker.company}
					/>
				</div>
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
					<p>{events.venue.country.nicename ?? '---'}</p>
					{#if events.venue.location}
						<div class="text-ellipsis underline">
							<a
								target="_blank"
								href={`${gMapsLink(
									events.venue.location.lat,
									events.venue.location.lng
								)}`}
							>
								Abrir Mapa
							</a>
						</div>
					{:else}
						<p>{'---'}</p>
					{/if}
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
							<img src={picture?.url ?? ''} alt={picture.name} class="rounded-lg" />
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<!-- Organizer -->
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Organizer full name:</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={1} />
				</div>
			{:else if events.organizer}
				<div class="content">
					<p>{events.organizer.name ?? '---'}</p>
				</div>
			{/if}
		</div>
		<div class="w-[600px] min-h-[100px] text-neutral-3">
			{#if loading}
				<div class="h-[100px]">
					<SimpleSkeleton width={600} height={20} items={4} />
				</div>
			{:else if events.organizer}
				<p>{events.organizer.description ?? '---'}</p>
			{/if}
		</div>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Photo</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={1} />
				</div>
			{:else if events.organizer}
				<div class="text-ellipsis underline">
					<a target="_blank" href={`${events.organizer.logo?.url ?? ''}`}>
						Organizer Photo
					</a>
				</div>
			{/if}
		</div>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="flex items-center justify-center w-[200px] h-[200px]">
				<ProfilePic img={events?.organizer.logo.url} />
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={1} />
				</div>
			{:else if events.organizer}
				<div class="flex flex-col gap-y-4">
					<Socials speaker={events.organizer} color={'#000'} />
					<div class="flex gap-x-2">
						<div
							class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md"
						>
							{#if events.organizer}
								<svelte:component
									this={Flag[capText(events.organizer.country.iso)]}
									size="20"
								/>
								{events.organizer.country.nicename}
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Subscription to event</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={1} />
				</div>
			{:else if events.organizer}
				<p>{events.mailing ?? '---'}</p>
			{/if}
		</div>
		<div class="flex flex-row gap-6 max-w-fit">
			<MainButton href={`/events/${$page.params.id}/edit`}>
				<div class="flex gap-3 items-center">
					<Icon size="20" src={BiEditAlt} />
					{'Edit'}
				</div>
			</MainButton>
			{#if events?.status === 0 || events?.status === 1}
				<MainButton on:click={handleOpenModal}>
					<div class="flex gap-3 items-center">
						<Icon size="20" src={IoClose} />
						{'Suspend'}
					</div>
				</MainButton>
			{:else if events?.status === 3}
				<div class="w-fit">
					<MainButton on:click={handleOpenConfirmationModal}>
						<div class="flex gap-5">
							{'Revoque Suspension'}
						</div>
					</MainButton>
				</div>
				<Modal isOpen={isOpenConfirmation} handleClose={handleCloseConfirmationModal}>
					<ApprovedModal
						text="Are you sure you would like to revoke suspension for this User?"
						onConfirm={handleUnsuspend}
						onCancel={handleCloseConfirmationModal}
					/>
				</Modal>
			{/if}
		</div>
		<Modal {isOpen} handleClose={handleCloseModal} title="">
			<SuspendOrganizer
				on:submit={handleSuspend}
				{events}
				items={options}
				title={'Do you really want to suspend the event?'}
				handleClose={handleCloseModal}
			/>
		</Modal>
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
	.content div {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
