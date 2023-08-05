<script lang="ts">
	import * as Flag from 'svelte-flag-icons'
	import ProfilePic from '../ProfilePic.svelte'
	import Socials from './Socials.svelte'
	import TextBadge from './TextBadge.svelte'

	export let item: any
	export let country: string | null = null
	export let flag: any = null

	function capText(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
	}
</script>

<div
	class="w-full flex flex-col @md:flex-row justify-between items-center bg-brand-gray p-4 @lg:px-14 @lg:py-6 rounded-lg my-4"
>
	<div class="w-full flex flex-row items-center gap-6 mb-3 @md:mb-0">
		<div class="w-[71px] @lg:w-[100px] bg-main-gradient rounded-full p-[1px]">
			<div class="w-full aspect-square relative rounded-full">
				{#if item.picture}
					<ProfilePic img={item.picture.url} />
				{:else if item.logo}
					<ProfilePic img={item.logo.url} />
				{/if}
			</div>
		</div>
		<div class="flex flex-col @lg:flex-row @lg:items-center gap-3 @lg:gap-6">
			<p class="@lg:leading-none text-2xl text-center @lg:text-start @lg:w-max">
				{item.name}
			</p>
			<Socials speaker={item} color={'white'} />
		</div>
	</div>
	<div class="flex justify-center @md:justify-end items-center gap-3 flex-wrap">
		{#if flag}
			<div class="flex gap-x-2 items-center bg-black py-1 px-4 text-white rounded-md">
				<svelte:component this={Flag[capText(flag)]} size="20" />
				{country}
			</div>
		{/if}
		<TextBadge item={item.company} />
		<TextBadge item={item.jobRole} />
	</div>
</div>
