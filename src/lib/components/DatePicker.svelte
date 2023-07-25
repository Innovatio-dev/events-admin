<script lang="ts">
	import Input from './Input.svelte'
	import Icon from 'svelte-icons-pack'
	import AiOutlineCalendar from 'svelte-icons-pack/ai/AiOutlineCalendar'
	import SveltyPicker from 'svelty-picker'

	import Popup from './Popup.svelte'
	import MainButton from './MainButton.svelte'

	export let placeholder: string = ''
	export let value: Date | null = null
	function formatDateToCustomString(date) {
		// Obtiene los componentes de la fecha
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')

		// Crea la cadena de formato personalizado "yyyy-mm-dd hh:ii"
		const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`

		return formattedDate
	}
	function parseDateStringToDate(dateString) {
		const [datePart, timePart] = dateString.split(' ')
		const [year, month, day] = datePart.split('-')
		const [hours, minutes] = timePart.split(':')

		// Ten en cuenta que el mes en JavaScript comienza en 0 (enero es 0, febrero es 1, etc.)
		const date = new Date(year, month - 1, day, hours, minutes)
		return date
	}
	let date: string | null = null
	$: {
		date = value ? formatDateToCustomString(value) : ''
	}
	let inputRef: HTMLElement
	let popupRef: Popup
	function handleDateChange(ev) {
		date = ev.detail
	}
	function handleFocus(ev) {
		popupRef.show()
	}

	function handleSave() {
		if (date) {
			value = parseDateStringToDate(date)
		} else {
			value = null
		}
		popupRef.hide()
	}
</script>

<Input
	bind:domElement={inputRef}
	bind:placeholder
	on:focus={handleFocus}
	value={value ? formatDateToCustomString(value) : ''}
	readOnly={true}
>
	<Icon slot="trailing" src={AiOutlineCalendar} color="currentColor" />
</Input>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<Popup bind:this={popupRef} trigger={inputRef} desiredWidth={'fit-content'}>
	<div class="date-container">
		<div class="header">
			{date ? date : 'Date is empty'}
		</div>
		<div class="body">
			<SveltyPicker
				pickerOnly={true}
				inputClasses="form-control"
				format="yyyy-mm-dd hh:ii"
				value={date}
				on:change={handleDateChange}
			/>
		</div>
		<div class="actions">
			<MainButton on:click={() => popupRef.hide()}>Cancel</MainButton>
			<MainButton on:click={handleSave}>Ok</MainButton>
		</div>
	</div>
</Popup>

<style lang="scss">
	.date-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-flow: column;
		width: fit-content;
		height: fit-content;
		background: #fff;
		.header {
			padding: 1em;
			width: 100%;
			background: var(--gd-icon);
			color: #fff;
		}
		.body {
			height: 100%;
			display: flex;
			align-items: center;
		}
		.actions {
			height: 50px;
			width: 100%;
			display: flex;
			gap: 0.5em;
			padding: 0.5rem;
		}
	}
</style>
