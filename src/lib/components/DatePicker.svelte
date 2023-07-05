<script lang="ts">
	import { DatePicker, localeFromDateFnsLocale } from 'date-picker-svelte'
	import { hy } from 'date-fns/locale'
	import Input from './Input.svelte'
	import Icon from 'svelte-icons-pack'
	import AiOutlineCalendar from 'svelte-icons-pack/ai/AiOutlineCalendar'
	import Popup from './Popup.svelte'
	let date = new Date()
	let locale = localeFromDateFnsLocale(hy)
	let inputRef: HTMLElement
	let popupRef: Popup
	function handleFocus(ev) {
		popupRef.show()
	}
	$: {
		console.log(inputRef)
	}
</script>

<Input bind:domElement={inputRef} placeholder="date here" on:focus={handleFocus}>
	<Icon slot="trailing" src={AiOutlineCalendar} color="currentColor" />
</Input>

<Popup bind:this={popupRef} trigger={inputRef} />
