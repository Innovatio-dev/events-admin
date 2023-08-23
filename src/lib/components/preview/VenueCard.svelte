<script lang="ts">
	import TextBadge from './TextBadge.svelte'
	import Icon from 'svelte-icons-pack/Icon.svelte'
	import TiLocation from 'svelte-icons-pack/ti/TiLocation'

	export let image: string
	export let title: string
	export let content: string
	export let location: string
	export let city: string
	export let country: string
	export let continent: string
</script>

<div class="flex flex-col w-full py-4">
	<div
		class="w-full flex flex-col lg:flex-row lg:max-h-[500px] h-fit bg-[#161718] lg:mx-auto my-4 rounded-lg"
	>
		<div class="flex lg:flex-col h-[200px] md:h-[400px] w-full lg:w-1/2 relative">
			{#if image}
				<img src={image} alt={image} class="object-cover rounded-lg" />
			{:else}
				<div class="flex w-full h-full items-center justify-center py-6 px-8">
					No image found
				</div>
			{/if}
		</div>
		<div class="flex flex-col w-full lg:w-1/2 p-6 lg:p-12">
			<h3 class="text-3xl mb-6">{title}</h3>
			<div class="flex flex-col">
				<span class="flex flex-row items-center">
					<p class="text-lg font-light mr-4">{` ${city} - ${country} `}</p>
				</span>
				<span class="flex flex-row items-center gap-x-2">
					<Icon src={TiLocation} size={'1.5em'} class="mr-2 text-white" color={'#fff'} />
					<p class="text-lg font-light">{location}</p>
				</span>
			</div>
			<p class="my-4 text-lg line-clamp-3">{content}</p>
			<div class="flex gap-2 flex-wrap">
				<TextBadge item={city} />
				<TextBadge item={continent} />
			</div>
		</div>
	</div>
</div>
