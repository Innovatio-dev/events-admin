<script lang="ts">
	import Icon from 'svelte-icons-pack'
	export let value: {
		icon: any
		text: string
	}
</script>

<div class="w-full h-full overflow-hidden text-ellipsis justify-center flex items-center gap-2 p-4">
	{#if value.icon}
		<div class="icon">
			<Icon src={value.icon} color="currentColor" size="2em" />
		</div>
	{/if}
	{#if value.text}
		<div class="w-full whitespace-nowrap overflow-hidden text-ellipsis text-left">
			{value.text}
		</div>
	{/if}
</div>
