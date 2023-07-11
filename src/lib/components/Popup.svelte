<script lang="ts">
	import { onMount } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	export let trigger: HTMLElement | null = null
	let visible = false
	export function show() {
		visible = true
	}
	export function hide() {
		visible = false
	}
	onMount(() => {
		const handleBackButton = (event) => {
			event.preventDefault()
		}
		window.addEventListener('popstate', handleBackButton)
		return () => {
			window.removeEventListener('popstate', handleBackButton)
		}
	})
</script>

{#if visible}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="main-container">
		<div class="bg" transition:fade on:click|self={hide} />
		<div transition:slide class="slot-container">
			<slot />
		</div>
	</div>
{/if}

<style lang="scss">
	.main-container {
		position: fixed;
		inset: 0;
		z-index: 9999;
		.bg {
			background-color: #000000a0;
			position: absolute;
			inset: 0;
		}
		.slot-container {
			background: var(--gd-page);
			position: absolute;
			overflow-y: auto;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			background-color: beige;
			width: fit-content;
			max-width: 640px;
			max-height: 80%;
			height: fit-content;
			border-radius: 1em 1em 0 0;
		}
	}
</style>
