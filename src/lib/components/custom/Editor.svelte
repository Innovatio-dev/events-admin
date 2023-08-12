<script lang="ts">
	// Svelte
	import { createEventDispatcher, onMount } from 'svelte'

	// Props
	export let value = ''
	export let name

	// State
	let editor
	let data = ''

	const dispatch = createEventDispatcher()

	const options = {
		theme: 'snow',
		plainclipboard: true
	}

	onMount(async () => {
		const quill = await import('@tadashi/svelte-editor-quill')
		editor = quill.Editor
		if (value) {
			data = value
		}
	})

	function onTextChange(event) {
		value = event.detail.html
		dispatch('change', { value: event.detail.html, name: name })
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://cdn.quilljs.com" crossorigin="true" />
	<link rel="stylesheet" href="https://cdn.quilljs.com/1.3.7/quill.snow.css" />
</svelte:head>

<svelte:component
	this={editor}
	{data}
	{options}
	on:text-change={onTextChange}
	class="[&>.ql-snow]:bg-white [&>.ql-toolbar]:rounded-t-[10px] [&>.ql-container]:rounded-b-[10px] [&>.ql-snow]:!border-2 [&>.ql-snow]:!border-input-outline h-32"
/>
