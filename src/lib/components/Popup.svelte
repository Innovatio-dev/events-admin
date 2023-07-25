<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	export let trigger: HTMLElement
	export let desiredAlign: 'right' | 'left' = 'right'
	export let desiredPosition: 'top' | 'bottom' = 'bottom'
	export let desiredWidth = 'same'
	export let desiredHeight = '400px'
	export let scrollerRef: HTMLDivElement | null = null

	let wrapper: HTMLDivElement
	let visible = false
	let containerStyle = ''
	let dispatcher = createEventDispatcher()
	export function show() {
		visible = true
		computeStyle()
		dispatcher('show')
	}
	export function hide() {
		visible = false
		dispatcher('hide')
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
	function handleScrollContainer(event) {
		dispatcher('scroll', event)
	}
	function computeStyle() {
		if (window.innerWidth > 600) {
			const triggerRect = trigger.getBoundingClientRect()
			const wrapperRect = wrapper.getBoundingClientRect()
			let style = ''
			const spaceAbove = triggerRect.top
			const spaceBelow = window.innerHeight - triggerRect.bottom
			const spaceLeft = triggerRect.left
			const spaceRight = window.innerWidth - triggerRect.right
			// Obtener el ancho del scrollbar horizontal si está presente
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

			if (desiredPosition == 'bottom') {
				if (spaceBelow >= wrapperRect.height || spaceBelow >= spaceAbove) {
					style = `top: ${triggerRect.bottom}px; max-height: ${spaceBelow}px;`
				} else {
					style = `bottom: ${
						window.innerHeight - triggerRect.top
					}px; max-height: ${spaceAbove}px;`
				}
			} else {
				if (spaceAbove >= wrapperRect.height || spaceAbove >= spaceBelow) {
					style = `bottom: ${
						window.innerHeight - triggerRect.top
					}px; max-height: ${spaceAbove}px;`
				} else {
					style = `top: ${triggerRect.bottom}px; max-height: ${spaceBelow}px;`
				}
			}
			if (desiredAlign == 'left') {
				style = style + `left: ${triggerRect.left}px;`
			} else {
				// Ajustar la posición con el ancho del scrollbar si es necesario
				style = style + `right: ${spaceRight - scrollbarWidth}px;`
			}

			if (desiredWidth == 'same') {
				style = style + `width: ${triggerRect.width}px;`
			} else {
				style = style + `width: ${desiredWidth};`
			}

			containerStyle = style
		} else {
			containerStyle = ''
		}
	}
</script>

<svelte:window on:resize={computeStyle} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="main-container" class:visible>
	{#if visible}
		<div class="bg" transition:fade on:click|self={hide} />
	{/if}
	<div
		bind:this={scrollerRef}
		class="scroll-container"
		style={containerStyle}
		on:scroll={handleScrollContainer}
	>
		<div bind:this={wrapper} transition:slide class="slot-container">
			<slot />
		</div>
	</div>
</div>

<style lang="scss">
	.main-container {
		position: fixed;
		z-index: 9999;
		height: 0px;
		top: 0px;
		left: 0px;
		right: 0px;
		overflow: hidden;
		&.visible {
			height: 100%;
		}
		.bg {
			position: absolute;
			inset: 0;
		}
	}
	.scroll-container {
		overflow-y: auto;
		position: absolute;
		box-shadow: 0px 0px 10px #00000056;
		border-radius: 0.8em;
		.slot-container {
			position: relative;
		}
	}
</style>
