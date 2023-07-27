<script lang="ts">
	import { page } from '$app/stores'

	import Input from '../Input.svelte'
	import MainButton from '../MainButton.svelte'

	// Props
	export let onCancel = () => {}

	// State
	let email = ''
	let reEmail = ''
	let isEmailUnmatching = false
	let isChangeLoading = false
	let isChangeError = false

	// Request
	async function changeEmail() {
		try {
			handleMatchEmail()
			if (isEmailUnmatching) {
				return
			}
			isChangeLoading = true
			isChangeError = false
			const res = await fetch(`${$page.url.origin}/api/admins/${$page.params.id}/email`, {
				method: 'PUT',
				body: JSON.stringify({ newEmail: email })
			})

			if (res.ok) {
				await res.json()
				location.reload()
			} else {
				console.log(await res.json())
				isChangeError = true
			}
		} catch (error) {
			console.error('Error:', error)
			isChangeError = true
		} finally {
			isChangeLoading = false
		}
	}

	// Handlers
	function handleMatchEmail() {
		if (email !== reEmail) {
			isEmailUnmatching = true
			return
		}
		isEmailUnmatching = false
	}

	function handleSubmitEmail() {
		changeEmail()
	}

	function handleCancelEmail() {
		onCancel()
		email = ''
		reEmail = ''
		isEmailUnmatching = false
	}
</script>

<form
	on:submit|preventDefault={handleSubmitEmail}
	class="w-full max-w-2xl flex flex-col gap-8 mx-auto"
>
	<Input
		label="Change email to"
		type="email"
		bind:value={email}
		placeholder="Type the new email"
		required
	/>
	<div>
		<Input
			on:blur={handleMatchEmail}
			label="Re-type the changed mail"
			type="email"
			bind:value={reEmail}
			placeholder="Confirm the new email"
			required
		/>
		{#if isEmailUnmatching}
			<p class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
				Both email should be equal.
			</p>
		{/if}
		{#if isChangeError}
			<p class="bg-alert-error text-sm font-medium text-white font-dm rounded-lg py-2 px-4">
				An error has occurred, please try again.
			</p>
		{/if}
	</div>

	<div class="w-full grid grid-cols-2 gap-8">
		<MainButton loading={isChangeLoading}>Change email</MainButton>
		<button
			type="button"
			class="hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
			on:click={handleCancelEmail}
			>Cancel
		</button>
	</div>
</form>
