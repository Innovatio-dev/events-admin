<script lang="ts">
	import ProfilePic from './ProfilePic.svelte'
	import * as Flag from 'svelte-flag-icons'

	export let image: string
	export let size: string
	export let company: string
	export let jobRole: string
	export let iso: any = null
	export let country: string | null = null
</script>

<div class="w-full h-full flex items-center py-2 px-4 gap-x-4">
	<div class={`w-[${size}px] h-[${size}px] min-h-[${size}px] min-w-[${size}px]`}>
		<ProfilePic maxSize={size} img={image} />
	</div>
	{#if iso}
		<div class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md">
			<svelte:component this={Flag[iso]} size="20" />
			{country}
		</div>
	{/if}
	{#if company}
		<div class="flex min-w-fit gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md">
			{company}
		</div>
	{/if}
	{#if jobRole}
		<div class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md">
			{jobRole}
		</div>
	{/if}
</div>
