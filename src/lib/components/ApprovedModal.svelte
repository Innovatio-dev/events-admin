<script>
	import MainButton from './MainButton.svelte'
	
	export let onConfirm = () =>{}
	export let onCancel = () =>{}

</script>

<div class="flex flex-col px-10 py-5 gap-12">
	<p class="text-neutral-4 text-md font-thin">
		{'Are you sure you want to approve the application?'}
	</p>
	<div class="flex w-full justify-center gap-5">
		<div class="w-[5rem]">
			<MainButton on:click={onConfirm}>
				{'Yes'}
			</MainButton>
		</div>
		<div class="w-[5rem]">
			<MainButton on:click={onCancel}>
				{'No'}
			</MainButton>
		</div>
	</div>
</div>
