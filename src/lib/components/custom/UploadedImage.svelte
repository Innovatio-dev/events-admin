<script>
	// Svelte
	import { createEventDispatcher } from 'svelte'
	// Components
	import ProfilePic from '../ProfilePic.svelte'
	// Icons
	import Icon from 'svelte-icons-pack'
	import CgTrash from 'svelte-icons-pack/cg/CgTrash'

	// Props
	export let image
	export let clickAction = () => {}

	const dispatch = createEventDispatcher()

	function handleClick() {
		clickAction()
	}
</script>

<div class="w-full flex justify-center items-center text-neutral-4">
	<div class="flex flex-col justify-center gap-5">
		<!-- <span class="font-semibold">
			{'Organizer Photo'}
		</span> -->
		<div class="w-full flex justify-center">
			<div class="w-32 h-32 min-w-[8rem]">
				<ProfilePic img={image} />
			</div>
		</div>
		<div class="flex items-center justify-center gap-5">
			<span class="font-light">
				{#if image}
					{image.slice(0, 20) + '...'}
				{/if}
			</span>
			<button
				class="bg-white rounded-lg w-8 h-8 flex justify-center items-center"
				on:click={handleClick}
			>
				<Icon src={CgTrash} color="currentColor" size="20px" />
			</button>
		</div>
	</div>
</div>
