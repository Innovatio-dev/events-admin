<script>
	import { onMount } from 'svelte'

	export let value = 'Apenas um show'
	export let name
	let editor

	const options = {
		theme: 'snow',
		plainclipboard: true
	}

	onMount(async () => {
		const quill = await import('@tadashi/svelte-editor-quill')
		editor = quill.Editor
	})

	function onTextChange(event) {
		value = JSON.stringify(event.detail.html)
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://cdn.quilljs.com" crossorigin="true" />
	<link rel="stylesheet" href="https://cdn.quilljs.com/1.3.7/quill.snow.css" />
</svelte:head>

<svelte:component
	this={editor}
	{options}
	on:text-change={onTextChange}
	data={value}
	class="[&>.ql-snow]:bg-white [&>.ql-toolbar]:rounded-t-[10px] [&>.ql-container]:rounded-b-[10px] [&>.ql-snow]:!border-2 [&>.ql-snow]:!border-input-outline"
/>
<input type="hidden" {name} {value} />
