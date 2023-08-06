<script>
	// Components
	import MainButton from './MainButton.svelte'
	// Props
	export let text = 'Are you sure you want to approve the application?'
	export let yesButtonText = 'Yes'
	export let noButtonText = 'No'
	export let isLoading = false
	export let onConfirm = () => {}
	export let onCancel = () => {}
</script>

<div class="flex flex-col px-10 py-5 gap-12">
	<p class="text-neutral-4 text-md font-thin">
		{text}
	</p>
	<div class="flex w-full justify-center gap-5">
		<div class="w-[5rem]">
			<MainButton loading={isLoading} on:click={onConfirm}>
				{yesButtonText}
			</MainButton>
		</div>
		<div class="w-[5rem]">
			<MainButton on:click={onCancel}>
				{noButtonText}
			</MainButton>
		</div>
	</div>
</div>
