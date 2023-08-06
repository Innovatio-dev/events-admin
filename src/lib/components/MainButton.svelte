<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	// Props
	export let disabled = false
	export let loading = false
	export let fit = false
	export let href: string | undefined = undefined

	const disabledStyle = 'bg-neutral-1 text-neutral-4 border-0 pointer-events-none'

	function handleClick() {
		// To use on click events when instanced.
		dispatch('click')
	}
</script>

{#if href}
	<a {href} class="hover:no-underline">
		<button
			class="{disabled ? disabledStyle : ''} {loading
				? 'cursor-wait'
				: ''} hover:no-underline group test hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
			disabled={disabled || loading}
		>
			{#if loading}
				<span class="w-full h-full flex items-center justify-center">
					<div class="relative">
						<div
							class="border-t-[#ffffff00] border-solid animate-spin rounded-full border-[0.3rem] h-5 w-5"
						/>
					</div>
				</span>
			{:else}
				<slot />
			{/if}
		</button>
	</a>
{:else}
	<button
		style={`${fit ? 'width: fit-content' : ''}`}
		class="{disabled ? disabledStyle : ''} {loading
			? 'cursor-wait'
			: ''} hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
		disabled={disabled || loading}
		on:click={handleClick}
	>
		{#if loading}
			<span class="w-full h-full flex items-center justify-center">
				<div class="relative">
					<div
						class="border-t-[#ffffff00] border-solid animate-spin rounded-full border-[0.3rem] h-5 w-5"
					/>
				</div>
			</span>
		{:else}
			<slot />
		{/if}
	</button>
{/if}

<style lang="scss">
	button {
		&:hover {
			svg {
				fill: var(--white) !important;
			}
		}
	}
</style>
