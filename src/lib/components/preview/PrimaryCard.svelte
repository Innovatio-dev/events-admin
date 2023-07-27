<script lang="ts">
	import ProfilePic from '../ProfilePic.svelte'
	import Socials from './Socials.svelte'
	import TextBadge from './TextBadge.svelte'

	export let item: any
</script>

<div class="flex px-12 py-6 bg-brand-gray rounded-md my-4">
	<div class="w-[20%]">
		<div class="w-[160px] h-[160px]">
			{#if item.picture}
				<ProfilePic img={item.picture.url} />
			{:else if item.logo}
				<ProfilePic img={item.logo.url} />
			{/if}
		</div>
	</div>
	<div class="flex flex-col gap-5 pl-6">
		<div
			class="flex flex-col lg:flex-row items-center md:items-start lg:items-center gap-3 lg:gap-6"
		>
			<p class="text-3xl lg:text-4xl text-center lg:text-start">{item.name}</p>
			{#if item}
				<Socials speaker={item} color={'white'} />
			{/if}
		</div>
		<div class="flex justify-center md:justify-normal items-center gap-3 flex-wrap">
			<TextBadge item={'flag'} />
			{#if item.company}
				<TextBadge item={item.company} />
			{/if}
			{#if item.jobRole}
				<TextBadge item={item.jobRole} />
			{/if}
		</div>
		<p class="font-dm text-sm lg:text-xl text-center md:text-start">{item.description}</p>
	</div>
</div>
