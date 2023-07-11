<script lang="ts">
	import { DatePicker, localeFromDateFnsLocale } from 'date-picker-svelte'
	import { hy } from 'date-fns/locale'
	import Input from './Input.svelte'
	import Icon from 'svelte-icons-pack'
	import AiOutlineCalendar from 'svelte-icons-pack/ai/AiOutlineCalendar'
	import AiOutlineFieldTime from 'svelte-icons-pack/ai/AiOutlineFieldTime'

	import Popup from './Popup.svelte'
	import MainButton from './MainButton.svelte'
	let date = new Date()
	let locale = localeFromDateFnsLocale(hy)
	let inputRef: HTMLElement
	let popupRef: Popup
	let currentStep = 0
	let currentDate: Date = new Date()
	let currentTime = {
		hours: 0,
		minutes: 0,
		am: true
	}
	let formattedDate: string = ''
	function handleFocus(ev) {
		popupRef.show()
	}
	$: {
		formattedDate = new Intl.DateTimeFormat('en-US', {
			day: '2-digit',
			month: 'short'
		}).format(currentDate)
	}
</script>

<Input bind:domElement={inputRef} placeholder="date here" on:focus={handleFocus}>
	<Icon slot="trailing" src={AiOutlineCalendar} color="currentColor" />
</Input>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<Popup bind:this={popupRef} trigger={inputRef}>
	<div class="date-container">
		<div class="tabs">
			<div class="date" on:click={() => (currentStep = 0)} class:selected={currentStep == 0}>
				{formattedDate}
			</div>
			<div class="time">
				<span on:click={() => (currentStep = 1)} class:selected={currentStep == 1}>
					{currentTime.hours.toString().padStart(2, '0')}
				</span>
				<span>:</span>
				<span on:click={() => (currentStep = 2)} class:selected={currentStep == 2}>
					{currentTime.minutes.toString().padStart(2, '0')}
				</span>
				<span class="meridian">
					<div on:click={() => (currentTime.am = true)} class:selected={currentTime.am}>
						AM
					</div>
					<div on:click={() => (currentTime.am = false)} class:selected={!currentTime.am}>
						PM
					</div>
				</span>
			</div>
		</div>
		<div class="tab-content">
			{#if currentStep == 0}
				<DatePicker bind:value={currentDate} on:select={(ev) => (currentStep = 1)} />
			{:else if currentStep > 0}
				<div class="clock" />
			{/if}
		</div>
		<div class="actions">
			<MainButton>Cancel</MainButton>
			<MainButton>Ok</MainButton>
		</div>
	</div>
</Popup>

<style lang="scss">
	.date-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-flow: column;
		width: 500px;
		height: 400px;
		.tabs {
			width: 100%;
			background-color: var(--accent);
			color: #ffffffbf;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 1rem;
			padding: 0.6em;
			font-size: 1em;
			.selected {
				color: #fff;
			}
			.date {
				font-size: 3em;
				cursor: pointer;
				transition: color 0.3s ease-in-out;
			}
			.time {
				display: flex;
				gap: 0.2em;
				font-size: 3em;
				> span {
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;

					transition: color 0.3s ease-in-out;
				}
				.meridian {
					display: flex;
					flex-flow: column;
					align-items: center;
					font-size: 0.4em;
					gap: 0.2em;
					justify-content: center;
					> div {
						line-height: 0.8em;
					}
				}
			}
		}
		.tab-content {
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
	.clock {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background-color: #00000020;
	}
</style>
