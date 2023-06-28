<script lang="ts">
	import ProfilePic from '../ProfilePic.svelte'
	export let fields: string[]
	export let content: string[]
</script>

<div class="grid w-full h-fit mb-6 gap-x-6">
	<div class="absolute w-[130px] h-[130px]">
		<ProfilePic />
	</div>
	<div class="grid grid-cols-2 px-8 ml-[130px]">
		<div>
			{#each fields as item}
				<p class="text-neutral-4 font-dm capitalize w-[180px] py-2">{item} :</p>
			{/each}
		</div>
		<div>
			{#each content as item}
				<p class="text-neutral-3 font-thin font-eesti min-w-fit w-[400px] py-2">{item}</p>
			{/each}
		</div>
	</div>
</div>