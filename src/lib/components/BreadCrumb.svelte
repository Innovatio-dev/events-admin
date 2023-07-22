<script lang="ts">
	// Svelte
	import { page } from '$app/stores'
	// Store
	import { pageStatus } from '$lib/stores/pageStatus'
	// Components
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	// Icons
	import Arrow from './icons/Arrow.svelte'

	const ratingColors: Record<number, string> = {
		0: 'warning',
		1: 'success',
		2: 'error'
	}
	let parts: string[] = []
	$: {
		let currentPage = $page
		parts = currentPage.url.pathname.split('/').filter((element) => element.trim() !== '')
		parts[parts.length - 1] = $pageStatus.title ?? ''
	}
</script>

{#if parts.length > 1}
	<div class="flex flex-col gap-3 relative py-6">
		<div class="flex gap-3 items-center text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{#each parts as bc, index}
				<a
					href="/{parts.slice(0, index + 1).join('/')}"
					class="text-neutral-4 {index == parts.length - 1
						? 'pointer-events-none'
						: ''} capitalize font-normal text-sm tracking-[0.5px]"
				>
					{bc.replace(/-/g, ' ')}
				</a>
				{index === parts.length - 1 ? '' : ' / '}
			{/each}
		</div>
		<div class="flex items-center gap-5">
			<a
				href="/{parts.slice(0, -1).join('/')}"
				class="bg-neutral-2 flex items-center justify-center rounded-full p-2 rotate-90"
			>
				<Arrow className="w-3 h-3" />
			</a>
			<span class="flex gap-5 font-normal text-3xl capitalize">
				{#if $pageStatus.title}
					{$pageStatus.title}
				{:else}
					<div class="w-full h-fit flex">
						<SimpleSkeleton bg="neutral-4" width={250} height={30} items={1} />
					</div>
				{/if}
			</span>
			<div class="w-6 h-6 rounded-full bg-alert-{ratingColors[$pageStatus.status ?? 3]}" />
		</div>
	</div>
{/if}
