<script lang="ts">
	import MainButton from '$lib/components/MainButton.svelte'
	import { onMount } from 'svelte'
	// Props
	export let handleClose: () => void
	export let selectedLabel: string
	export let handleOnSubmit: () => void
	export let items: { id: string; label: string }[]
	export let loading = false

	let selectedOption: string = ''
	let selectedId: string
	let updateOption: string = ''
	// Set initial value on text area
	onMount(() => {
		selectedOption = items[0].label
		selectedId = items[0].id
	})
	// Change value on textarea
	const handleOptionChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		selectedOption = target.value
		selectedId = target.id
		if (selectedOption === target.value) {
			updateOption = 'update'
		}
	}
	// update or create
	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		updateOption = target.value
		if (updateOption === 'create') {
			selectedOption = ''
		}
	}

	const handleSubmit = () => {
		if (updateOption === 'create') {
			items.push({ id: 'option' + (items.length + 1), label: selectedOption })
			selectedOption = ''
		} else {
			const index = items.findIndex((item) => item.id === selectedId)
			if (index !== -1) {
				items[index] = { id: selectedId, label: selectedOption }
				// isOpenModal = true
			} else {
				console.error('No se encontró el elemento con el ID:', selectedId)
			}
		}
		handleOnSubmit()
	}
	let newOption = ''
</script>

<div class="w-fit px-16 flex flex-col items-center text-center text-neutral-4">
	<h4 class="font-semibold text-black">
		{'Do you really want to deny this application?'}
	</h4>
	<div class="flex flex-col text-left w-[90%] mt-6 gap-y-4 max-w-[600px]" id="optionsContainer">
		{#each items as option}
			<li class="flex gap-x-6">
				<input
					id={option.id}
					type="radio"
					name="option"
					bind:group={selectedOption}
					on:change={handleOptionChange}
					checked={selectedOption === option.id}
					value={option.label}
				/>
				<label for={option.id}>{option.label}</label>
			</li>
		{/each}
	</div>
	<textarea
		class="w-full rounded-lg border-neutral-3 my-4 h-36 border-[1px] p-4 resize-none"
		placeholder="Write new template"
		bind:value={selectedOption}
		on:change={() => (selectedLabel = selectedOption)}
		id={selectedId}
	/>
	<div class="flex justify-around w-full gap-x-12 mx-auto">
		<div class="flex gap-x-4">
			<input
				type="radio"
				name="template"
				id="update"
				value="update"
				checked={updateOption === 'update'}
				on:change={handleChange}
			/>
			<label for="update">Update template</label>
		</div>
		<div class="flex gap-x-4">
			<input
				type="radio"
				name="template"
				id="create"
				value="create"
				checked={updateOption === 'create'}
				on:change={handleChange}
			/>
			<label for="create">Create template</label>
		</div>
	</div>
	<div class="flex w-[90%] gap-x-12 mx-auto my-6 items-center justify-center">
		<div class="w-20">
			<MainButton {loading} on:click={handleSubmit}>
				{'Yes'}
			</MainButton>
			<!-- <svelte:component
				this={Modal}
				isOpen={isOpenModal}
				handleClose={handleCloseModal}
				title=""
				bgColor="bg-alert-error"
			>
				<div class="flex flex-col items-center justify-center py-6 w-[450px] px-12">
					<p>It’s not possible to remove the organizer because has associated events.</p>
					<div class="w-fit px-6 py-6">
						<MainButton on:click={handleClose}>
							<p>OK</p>
						</MainButton>
					</div>
				</div>
			</svelte:component> -->
		</div>
		<div class="w-20">
			<MainButton on:click={handleClose}>
				{'Cancel'}
			</MainButton>
		</div>
	</div>
</div>
