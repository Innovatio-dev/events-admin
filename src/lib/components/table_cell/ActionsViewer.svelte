<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import MainButton from '../MainButton.svelte'
	import BiEditAlt from 'svelte-icons-pack/bi/BiEditAlt'
	import CgTrash from 'svelte-icons-pack/cg/CgTrash'
	export let value: {
		onEdit?: any
		onRemove?: any
	}
</script>

<div class="h-full flex items-center px-2 gap-2">
	{#if value.onEdit}
		<MainButton on:click={value.onEdit}>
			<Icon size="22px" color="currentColor" src={BiEditAlt} />
		</MainButton>
	{/if}
	{#if value.onRemove}
		<MainButton on:click={value.onRemove}>
			<Icon size="22px" src={CgTrash} />
		</MainButton>
	{/if}
</div>
