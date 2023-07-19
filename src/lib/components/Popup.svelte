<script lang="ts">
	import { onMount } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	import { tick } from 'svelte'
	export let trigger: HTMLElement
	export let desiredAlign: 'right' | 'left' = 'right'
	export let desiredPosition: 'top' | 'bottom' = 'bottom'
	export let desiredWidth = 'fit-content'
	export let desiredHeight = '400px'
	let wrapper: HTMLDivElement
	let visible = false
	let containerStyle = ''
	export function show() {
		visible = true
		tick().then(() => {
			computeStyle()
		})
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

	function handleResize() {
		computeStyle()
	}
	function computeStyle() {
		if (window.innerWidth > 600) {
			const triggerRect = trigger.getBoundingClientRect()
			const wrapperRect = wrapper.getBoundingClientRect()
			console.log(triggerRect, wrapperRect)

			const spaceAbove = triggerRect.top
			const spaceBelow = window.innerHeight - triggerRect.bottom
			const spaceLeft = triggerRect.left
			const spaceRight = window.innerWidth - triggerRect.right
			let top
			let left
			if (desiredPosition == 'bottom') {
				if (spaceBelow >= wrapperRect.height || spaceBelow >= spaceAbove) {
					top = triggerRect.bottom
				} else {
					top = triggerRect.top - wrapperRect.height
				}
			} else {
				if (spaceAbove >= wrapperRect.height || spaceAbove >= spaceAbove) {
					top = triggerRect.top - wrapperRect.height
				} else {
					top = triggerRect.bottom
				}
			}
			if (desiredAlign == 'left') {
				left = triggerRect.left
			} else {
				left = triggerRect.right - wrapperRect.width
			}
			containerStyle = `left: ${left}px; top:${top}px; width:${desiredWidth}; bottom:unset;  position:fixed;`
		} else {
			containerStyle = ''
		}
	}
</script>

<svelte:window on:resize={handleResize} />

<!-- svelte-ignore a11y-click-events-have-key-events -->

<div class="main-container" style={containerStyle} class:visible>
	<div class="bg" class:mobile={containerStyle == ''} transition:fade on:click|self={hide} />
	<div
		bind:this={wrapper}
		class:mobile={containerStyle == ''}
		transition:slide
		class="slot-container"
	>
		<slot />
	</div>
</div>

<style lang="scss">
	.main-container {
		position: fixed;
		inset: 0;
		z-index: 9999;
		opacity: 0;
		&.visible {
			opacity: 1;
		}
		.bg {
			background-color: #000000a0;
			position: absolute;
			inset: 0;
			display: none;
			&.mobile {
				display: block;
			}
		}
		.slot-container {
			background: var(--gd-page);
			overflow-y: auto;
			position: relative;
			width: fit-content;
			max-width: 640px;
			max-height: 80%;
			height: fit-content;
			border-radius: 1em 1em 0 0;
			&.mobile {
				bottom: 0;
				right: 0;
				top: 0;
				bottom: 0;
				left: 50%;
				position: absolute;
				transform: translateX(-50%);
			}
		}
	}
</style>
