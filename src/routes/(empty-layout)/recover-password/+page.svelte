<script lang="ts">
	import { goto } from '$app/navigation'
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import loginSplash from '$lib/images/login-splash.png'
	import { passwordSchema } from '$lib/utils/validation/schemas'
	import { getErrorMessages } from '$lib/utils/validation/validation'

	export let form

	let loading = false
	let error: null | string = null

	let email = ''
	let code = ''
	let password = ''

	let hasCode = false

	$: buttonText = hasCode ? 'Recover password' : 'Send recovery code'

	async function handleSubmit() {
		try {
			loading = true
			error = null
			if (hasCode) {
				const res = await fetch('/api/auth/recoverConfirm', {
					method: 'post',
					body: JSON.stringify({ code, email, password })
				})

				if (res.ok) {
					goto('/signin')
				} else {
					const err = await res.json()
					error = err.message
				}
			} else {
				const res = await fetch('/api/auth/recover', {
					method: 'post',
					body: JSON.stringify({ email })
				})

				if (res.ok) {
					hasCode = true
				} else {
					const err = await res.json()
					error = err.message
				}
			}
		} catch (err) {
			error = 'An error has occurred.'
		} finally {
			loading = false
		}
	}
</script>

<section class="h-screen w-screen bg-gd-page">
	<div class="h-full w-full flex relative">
		<div
			class="absolute z-10 w-[33%] h-full gradient-to-transparent left-1/2 -translate-x-1/2"
		/>
		<div class="h-full w-[50%] relative">
			<img alt="login-splash" class="w-full h-full object-cover" src={loginSplash} />
		</div>
		<div class="grow flex flex-col items-center justify-center p-2 z-20">
			<div class="welcome mb-2">
				<h2 class="text-accent font-bold text-center text-2xl">Recover your password</h2>
				<p class="text-center text-sm text-neutral-4">
					Please enter your email to get an recovery code.
				</p>
			</div>
			<div
				class="bg-form-color w-full max-w-sm rounded-2xl shadow-main px-8 py-16 max-h-full bg-gd-glassmorphism backdrop-blur-md overflow-y-auto"
			>
				<form class="flex-col flex gap-8" on:submit|preventDefault={handleSubmit}>
					<Input
						type="email"
						label="Email"
						name="email"
						bind:value={email}
						placeholder="Type your email"
						errorMessages={form?.error?.details
							? getErrorMessages(form.error, 'email')
							: []}
						disabled={hasCode}
					/>
					{#if hasCode}
						<Input
							type="text"
							label="Code"
							name="code"
							bind:value={code}
							placeholder="Type your recovery code"
							errorMessages={form?.error?.details
								? getErrorMessages(form.error, 'code')
								: []}
						/>
						<Input
							type="password"
							label="Password"
							name="password"
							bind:value={password}
							placeholder="Type your new password"
							validationSchema={passwordSchema}
							errorMessages={form?.error?.details
								? getErrorMessages(form.error, 'password')
								: []}
						/>
					{/if}

					{#if error}
						<div class="bg-alert-error text-neutral-1 px-4 py-2 rounded-lg">
							{error}
						</div>
					{/if}
					<MainButton disabled={loading} {loading}>{buttonText}</MainButton>
				</form>
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	.gradient-to-transparent {
		background: linear-gradient(
			90deg,
			rgba(217, 217, 217, 0) 0%,
			#e3e5ee 50%,
			rgba(223, 225, 231, 0.658704) 63.54%,
			rgba(217, 217, 217, 0.03) 100%
		);
	}
</style>
