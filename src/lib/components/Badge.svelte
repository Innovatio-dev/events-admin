<script lang="ts">
	// Svelte
	import { fade } from 'svelte/transition'
	// Icons
	import Icon from 'svelte-icons-pack/Icon.svelte'
	import AiOutlineCloseCircle from 'svelte-icons-pack/ai/AiOutlineCloseCircle'
	// Props
	export let type = 'primary'
	export let onClose = () => {}
	// State
	export let visible = true
	export let hideOnClose = true
	interface VariantColors {
		[key: string]: string
	}

	const variantColors: VariantColors = {
		primary: 'bg-alert-warning text-neutral-4 fill-neutral-4',
		secondary: 'bg-primary-hover text-white fill-white',
		success: 'bg-alert-success text-white fill-white',
		error: 'bg-alert-error text-white fill-white'
	}

	const handleClick = () => {
		if (hideOnClose) {
			visible = false
		}
		onClose()
	}
</script>

{#if visible}
	<span
		transition:fade={{ duration: 200 }}
		class="{variantColors[type] ||
			variantColors[
				'primary'
			]} w-fit py-2 flex items-center rounded-full pl-5 pr-3 gap-10 cursor-pointer"
	>
		<span class="">
			<slot />
		</span>
		<button on:click={handleClick}>
			<Icon src={AiOutlineCloseCircle} className="w-7 h-7" />
		</button>
	</span>
{/if}
