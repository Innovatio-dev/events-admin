<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Icon from 'svelte-icons-pack'
	import IoCaretBack from 'svelte-icons-pack/io/IoCaretBack'
	import IoCaretForward from 'svelte-icons-pack/io/IoCaretForward'
	//TODO: Complete this functionality
	export let itemWidth: string | null = null
	export let itemHeight: string | null = null
	export let aspectRatio: number | null = null
	export let scrollStep: number = 200

	let scrollableContainer: HTMLDivElement
	let nextEnabled: boolean = false
	let backEnabled: boolean = false

	function go(count: number) {
		scrollableContainer.scrollBy({
			behavior: 'smooth',
			left: count * scrollStep
		})
	}

	function onScroll() {
		nextEnabled = scrollableContainer.scrollLeft === 0
		backEnabled =
			scrollableContainer.scrollLeft + scrollableContainer.clientWidth ===
			scrollableContainer.scrollWidth
	}
	onMount(() => {
		scrollableContainer.addEventListener('scroll', onScroll)
	})

	onDestroy(() => {
		scrollableContainer.removeEventListener('scroll', onScroll)
	})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="carousel">
	<div class="scrollableContainer" bind:this={scrollableContainer}>
		<div class="scrollableContent">
			<slot />
		</div>
	</div>
	<div class="next" on:click={() => go(1)}>
		<div class="icon">
			<Icon src={IoCaretForward} size="32px" color="currentColor" />
		</div>
	</div>
	<div class="back" on:click={() => go(-1)}>
		<div class="icon">
			<Icon src={IoCaretBack} size="32px" color="currentColor" />
		</div>
	</div>
</div>

<style lang="scss">
	.carousel {
		position: relative;
		width: 100%;
		user-select: none;
		.next,
		.back {
			position: absolute;
			top: 50%;
			width: 2.5em;
			height: 2.5em;
			transform: translateY(-50%);
			background: var(--gd-icon);
			border-radius: 50%;
			padding: 0.3em;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			box-shadow: var(--shadow-icon);
		}
		.next {
			right: 0;
			transform: translate(-20%, -50%);
			.icon {
				transform: translateX(0.1em);
			}
		}
		.back {
			left: 0;
			transform: translate(20%, -50%);
			.icon {
				transform: translateX(-0.1em);
			}
		}
		.scrollableContainer {
			position: relative;
			width: 100%;
			height: 100%;
			overflow-x: auto;
			.scrollableContent {
				display: flex;
				gap: 1em;
				height: 100%;
				position: relative;
			}
		}
	}
</style>
