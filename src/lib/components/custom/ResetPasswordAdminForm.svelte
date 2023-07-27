<script lang="ts">
	import { page } from '$app/stores'

	import Icon from 'svelte-icons-pack'
	import BiRevision from 'svelte-icons-pack/bi/BiRevision'

	import Input from '../Input.svelte'
	import MainButton from '../MainButton.svelte'

	// Props
	export let onCancel = () => {}

	// State
	let password = ''
	let rePassword = ''
	let isResetLoading = false
	let isResetError = false

	let suggestedPassword = ''

	let validationErrors = {
		equal: false,
		length: false,
		number: false,
		specialChar: false,
		uppercase: false,
		lowercase: false
	}

	// Utils
	function validatePassword() {
		const hasEqual = password === rePassword

		const hasCorrectLength = password.length >= 8

		const hasNumber = /\d/.test(password)

		const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-]/.test(password)

		const hasUppercase = /[A-Z]/.test(password)

		const hasLowercase = /[a-z]/.test(password)

		validationErrors = {
			equal: !hasEqual,
			length: !hasCorrectLength,
			number: !hasNumber,
			specialChar: !hasSpecialChar,
			uppercase: !hasUppercase,
			lowercase: !hasLowercase
		}

		return (
			hasEqual &&
			hasCorrectLength &&
			hasNumber &&
			hasSpecialChar &&
			hasUppercase &&
			hasLowercase
		)
	}

	// Request
	async function resetPassword() {
		try {
			const hasError = validatePassword()
			if (!hasError) {
				return
			}
			isResetLoading = true
			isResetError = false
			const res = await fetch(`${$page.url.origin}/api/admins/${$page.params.id}/reset`, {
				method: 'PUT',
				body: JSON.stringify({ newPassword: password })
			})

			if (res.ok) {
				await res.json()
				handleCancelPassword()
			} else {
				console.log(await res.json())
				isResetError = true
			}
		} catch (error) {
			console.error('Error:', error)
			isResetError = true
		} finally {
			isResetLoading = false
		}
	}

	// Reset password handlers
	function handleGenerateRandomPassword() {
		suggestedPassword =
			Math.random().toString(36).slice(2, 9) +
			Math.random().toString(36).toUpperCase().slice(2, 9)
	}

	function handleValidatePassword() {
		validatePassword()
	}

	function handleSubmitPassword() {
		resetPassword()
	}

	function handleCancelPassword() {
		onCancel()
		password = ''
		rePassword = ''
		validationErrors = {
			equal: false,
			length: false,
			number: false,
			specialChar: false,
			uppercase: false,
			lowercase: false
		}
	}
</script>

<form
	on:submit|preventDefault={handleSubmitPassword}
	class="w-full max-w-2xl flex flex-col gap-8 mx-auto"
>
	<div class="w-full flex justify-between items-center">
		<p>Generate a new random password</p>
		<div class="w-40">
			<button
				type="button"
				class="hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
				on:click={handleGenerateRandomPassword}
			>
				<Icon size="22px" src={BiRevision} />
				<span>Generate</span>
			</button>
		</div>
	</div>
	{#if suggestedPassword !== ''}
		<div class="w-full flex justify-between items-center text-primary-purple font-dm">
			<span>{suggestedPassword}</span>
			<span class="text-sm font-medium">Suggested</span>
		</div>
	{/if}
	<Input
		label="Password"
		type="password"
		bind:value={password}
		placeholder="Type the password"
		required
	/>
	<div>
		<Input
			on:blur={handleValidatePassword}
			label="Re-type password"
			type="password"
			bind:value={rePassword}
			placeholder="Re-type password"
			required
		/>
		<ul class="list-disc marker:text-alert-error pl-4">
			{#if validationErrors.equal}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Passwords must be the same
				</li>
			{/if}
			{#if validationErrors.length}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Password must be at least 8 characters
				</li>
			{/if}
			{#if validationErrors.number}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Password must contain at least 1 number
				</li>
			{/if}
			{#if validationErrors.specialChar}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Password must contain at least 1 special character
				</li>
			{/if}
			{#if validationErrors.uppercase}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Password must contain at least 1 uppercase letter
				</li>
			{/if}
			{#if validationErrors.lowercase}
				<li class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
					Password must contain at least 1 lowercase letter
				</li>
			{/if}
		</ul>
		{#if isResetError}
			<p class="bg-alert-error text-sm font-medium text-white font-dm rounded-lg py-2 px-4">
				An error has occurred, please try again.
			</p>
		{/if}
	</div>

	<div class="w-full grid grid-cols-2 gap-8">
		<MainButton loading={isResetLoading}>Reset password</MainButton>
		<button
			type="button"
			class="hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
			on:click={handleCancelPassword}
			>Cancel
		</button>
	</div>
</form>
