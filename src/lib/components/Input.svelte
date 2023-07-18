<!-- Componente Input -->
<script lang="ts">
	import { getErrorMessages } from '$lib/utils/validation/validation'
	import type Joi from 'joi'
	import { createEventDispatcher } from 'svelte'
	import Icon from 'svelte-icons-pack'
	import FiAlertCircle from 'svelte-icons-pack/fi/FiAlertCircle'
	import EyeClosed from './icons/EyeClosed.svelte'
	import EyeOpened from './icons/EyeOpened.svelte'

	type InputType = 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | 'tel' | 'url'
	export let label: string = ''
	export let type: InputType = 'text'
	export let name: string = ''
	export let value: any = ''
	export let placeholder: string = ''
	export let errorMessages: string[] = []
	export let validationSchema: Joi.AnySchema | null = null
	export let domElement: HTMLElement | null = null
	export let readOnly: boolean = false
	export let required = false

	let currentType: InputType = type

	let inputRef: any = null
	let inputHasError = false
	let isFocused = false
	let showPassword = false

	const dispatch = createEventDispatcher()

	function handleChange(event: any) {
		value = (event.target as HTMLInputElement).value
		inputHasError = false
		dispatch('change', event)
	}
	function handleKeyPress(event: any) {
		dispatch('keypress', event)
	}

	export function focus() {
		inputRef.focus()
	}
	$: {
		if (validationSchema) {
			const { error } = validationSchema.validate(value)
			if (error) {
				errorMessages = getErrorMessages(error)
			} else {
				errorMessages = []
			}
		}
	}

	$: {
		if (type == 'password') {
			currentType = showPassword ? 'text' : 'password'
		}
		if (errorMessages.length > 0) {
			inputHasError = true
		}
	}
</script>

<label bind:this={domElement} class="flex flex-col w-full gap-2">
	{#if label}
		<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">
			{label}
		</span>
	{/if}
	<div class="flex relative">
		{#if $$slots.leading}
			<div class="leading">
				<slot name="leading" />
			</div>
		{/if}
		<input
			bind:this={inputRef}
			class="w-full {inputHasError ? 'error' : ''}"
			type={currentType}
			{name}
			{placeholder}
			{value}
			readonly={readOnly}
			on:focus={(ev) => {
				isFocused = true
				dispatch('focus', ev)
			}}
			on:blur={() => (isFocused = false)}
			on:input={handleChange}
			on:keypress={handleKeyPress}
			{required}
		/>
		<div class="actions {isFocused ? 'focused' : ''} {inputHasError ? 'error' : ''}">
			{#if type === 'password'}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="icon" on:click={() => (showPassword = !showPassword)}>
					{#if showPassword}
						<EyeClosed />
					{:else}
						<EyeOpened />
					{/if}
				</div>
			{/if}

			{#if $$slots.trailing}
				<div class="icon">
					<slot name="trailing" />
				</div>
			{/if}

			{#if inputHasError}
				<div class="icon">
					<Icon src={FiAlertCircle} />
				</div>
			{/if}
		</div>
	</div>
	{#if errorMessages.length > 0}
		<div class="text-xs text-input-text-error">
			{#each errorMessages as message}
				<span class="inline-block">{message}</span>
			{/each}
		</div>
	{/if}
</label>

<style lang="scss">
	input[type='text'],
	input[type='number'],
	input[type='tel'],
	input[type='url'],
	input[type='password'],
	input[type='email'] {
		border-radius: 10px;
		padding: 0.7rem calc(0.6rem * 20 / 12);
		border: 2px solid var(--input-outline);
		background-color: var(--input-bg);
		color: var(--input-text);
		font-weight: 400;
		font-size: 0.9rem;
		transition: border 0.3s ease-in-out;
		outline: none;
		&:focus {
			border: 2px solid var(--input-text);
		}
		&.error {
			border: 2px solid var(--input-text-error);
			background-color: var(--input-bg-error);
			color: var(--input-text-error);
		}
	}
	input[type='text']::placeholder,
	input[type='number']::placeholder,
	input[type='tel']::placeholder,
	input[type='url']::placeholder,
	input[type='password']::placeholder,
	input[type='email']::placeholder {
		color: var(--input-placeholder);
		font-size: 0.8rem;
	}

	input:-webkit-autofill,
	input:-webkit-autofill:hover,
	input:-webkit-autofill:focus,
	input:-webkit-autofill:active {
		-webkit-box-shadow: 0 0 0 30px var(--input-bg) inset !important;
	}
	input:-webkit-autofill {
		-webkit-text-fill-color: var(--input-text) !important;
	}
	.actions {
		position: absolute;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		top: 0;
		right: 0;
		padding: 0.7rem calc(0.6rem * 20 / 12);
		color: var(--input-placeholder);
		transition: color 0.3s ease-in-out;
		&.focused {
			color: var(--input-text);
		}
		&.error {
			color: var(--input-text-error);
		}
		.icon {
			cursor: pointer;
			font-size: 22px;
		}
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
