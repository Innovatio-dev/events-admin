<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import LocalTimeEvent from '../LocalTimeEvent.svelte'
	import BiSolidVideo from 'svelte-icons-pack/bi/BiSolidVideo'
	import MarkButton from './MarkButton.svelte'
	export let events: any
	export let loading: boolean
</script>

<div
	class="w-full flex flex-col lg:flex-row justify-between items-center gap-8 bg-[#161718] px-4 py-4 my-6 rounded-lg"
>
	<div class="w-full lg:w-auto flex md:items-center gap-7">
		<div class="lg:w-[87px] lg:h-[87px]" />
		<div class="w-[calc(100%-5.15rem)] lg:w-[calc(100%-6.75rem)] flex justify-between">
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
						class="flex items-center gap-x-5 font-dm text-sm font-light tracking-[0.5px]"
					>
						<div>
							{#if loading}
								loading
							{:else if events}
								<LocalTimeEvent dateString={events.schedule.startTime} />
							{/if}
						</div>
						<div class="flex items-center text-white! gap-x-3">
							<Icon src={BiSolidVideo} color="#fff" size="1.5em" />
							<span class="w-max underline text-brand-cyan">Zoom Link</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex items-center w-[200px] h-16">
			<MarkButton text="Mark the date" />
		</div>
	</div>
</div>
