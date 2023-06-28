<script lang="ts">
	// Svelte
	import { onMount, afterUpdate, onDestroy } from 'svelte'
	import { scale, fade } from 'svelte/transition'
	// State
	export let isOpen = false
	export let title: string = ''
	export let headStyle = 'text-white fill-white'
	export let contentStyle = 'text-black fill-blac'
	export let bgColor:string = 'bg-gd-icon'
	// Props
	export let handleClose: () => void
	// Icons
	import Icon from 'svelte-icons-pack'
	import IoCloseSharp from 'svelte-icons-pack/io/IoCloseSharp'

	let modalContainer: HTMLDivElement | null = null

	function handleOutsideClick(event: MouseEvent) {
		if (modalContainer && !modalContainer.contains(event.target as Node)) {
			handleClose()
		}
	}
</script>

<svelte:document on:mousedown={handleOutsideClick} />

{#if isOpen}
	<div
		transition:fade
		class="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-md"
	>
		<div class="absolute w-full h-full bg-white opacity-50" />
		<div
			bind:this={modalContainer}
			transition:scale
			class="{headStyle} relative rounded-2xl shadow-modal max-w-[90vw] w-auto overflow-hidden"
		>
			<div class={`px-5 flex justify-between items-center h-10 w-full ${bgColor} relative`}>
				<h2 class="text-lg capitalize font-medium">{title}</h2>
				<button on:click={handleClose}>
					<Icon className="h-6 w-6" src={IoCloseSharp} />
				</button>
			</div>
			<div
				class="{contentStyle} flex flex-col items-center p-4 bg-white max-h-[90vh] overflow-y-auto"
			>
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
