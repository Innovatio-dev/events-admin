<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import TiLocation from 'svelte-icons-pack/ti/TiLocation'
	import BiSolidVideo from 'svelte-icons-pack/bi/BiSolidVideo'
	import LocalTimeEvent from '../LocalTimeEvent.svelte'
	import Skeleton from '../skeletons/Skeleton.svelte'
	import DateSquare from './DateSquare.svelte'
	import MarkButton from './MarkButton.svelte'
	export let events: any
	export let loading: boolean

	console.log(events)
	function capText(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
	}
</script>

<div
	class="w-full flex flex-col @lg:flex-row justify-between items-center gap-8 bg-[#161718] px-4 py-4 my-6 rounded-lg"
>
	<div class="w-full flex @md:items-center gap-7">
		{#if loading}
			<Skeleton width={87} height={87} />
		{:else if events.schedule}
			<div class="flex justify-center items-center min-w-[90px]">
				<DateSquare
					date={events.schedule.startTime}
					className="@lg:w-[90px] @lg:h-[90px]"
					size={24}
				/>
			</div>
		{/if}
		<div
			class="w-[calc(100%-5.15rem)] @lg:min-w-[calc(100%-6.75rem)] flex flex-col @lg:flex-row justify-between"
		>
			<div class="w-full flex flex-col justify-between gap-4 @lg:gap-3">
				{#if loading}
					<Skeleton wFull height={30} />
				{:else if events}
					<span
						class="text-lg @md:text-3xl @lg:text-4xl font-dm font-semibold leading-none tracking-[0.005em] line-clamp-1"
						title={events.title ?? '---'}
					>
						{events.title ?? '---'}
					</span>
				{/if}
				<div class="flex flex-col @md:flex-row justify-between gap-2 @lg:gap-4">
					<div
						class="flex flex-col @md:flex-row items-center gap-x-5 font-dm text-sm font-light tracking-[0.5px]"
					>
						<div>
							{#if loading}
								<div class="flex gap-x-4">
									<Skeleton width={200} height={15} />
									<Skeleton width={100} height={15} />
								</div>
							{:else if events}
								<LocalTimeEvent dateString={events.schedule.startTime} />
							{/if}
						</div>
						<div class="flex items-center text-white! gap-x-3">
							{#if loading}
								<Skeleton width={100} height={15} />
							{:else if events.typeEvent === 0}
								<Icon src={BiSolidVideo} color="#fff" size="1.5em" />
								<span class="w-max underline text-brand-cyan">Zoom Link</span>
							{:else if events.typeEvent === 1}
								<Icon src={TiLocation} color="#fff" size="1.5em" />
								<span class="w-max">{events.venue.name}-{events.venue.city}</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<div class="flex items-center min-w-[200px] h-16">
				<MarkButton text="Mark the date" />
			</div>
		</div>
	</div>
</div>
