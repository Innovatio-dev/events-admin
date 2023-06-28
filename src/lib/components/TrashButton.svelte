<script>
	import Icon from 'svelte-icons-pack'
	import CgTrash from 'svelte-icons-pack/cg/CgTrash'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	function handleClick() {
		// To use on click events when instanced.
		dispatch('click')
	}
</script>

<button class="bg-white rounded-lg w-8 h-8 flex justify-center items-center" on:click={handleClick}>
	<Icon src={CgTrash} color="currentColor" size="20px" />
</button>
