<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import { onMount } from 'svelte'
	import Icon from 'svelte-icons-pack'
	import BiRevision from 'svelte-icons-pack/bi/BiRevision'

	// Admin data state
	let isLoading = false
	let isError = false
	let admin: any = null

	// Remove admin state
	let isRemoveLoading = false
	let isRemoveError = false
	let isOpenRemove = false

	// Reset password state
	let password = ''
	let rePassword = ''
	let isPasswordUnmatching = false
	let isResetLoading = false
	let isResetError = false
	let isResetFormShow = false

	let suggestedPassword = ''

	$: date = new Date(admin?.createdAt)
	$: joinDate = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	})

	onMount(() => {
		getAdminDetails()
	})

	// Requests
	async function getAdminDetails() {
		try {
			isLoading = true
			isError = false
			const res = await fetch(`${$page.url.origin}/api/admins/${$page.params.id}`)
			if (res.ok) {
				admin = await res.json()
			} else {
				isError = true
			}
		} catch (error) {
			console.log(error)
			isError = true
		} finally {
			isLoading = false
		}
	}

	async function deleteAdmin() {
		try {
			isRemoveLoading = true
			isRemoveError = false
			const res = await fetch(`${$page.url.origin}/api/admins/${$page.params.id}`, {
				method: 'DELETE'
			})
			if (res.ok) {
				isOpenRemove = false
				goto('/admin')
			} else {
				isRemoveError = true
				throw new Error(await res.json())
			}
		} catch (error) {
			console.log(error)
			isRemoveError = true
		} finally {
			isRemoveLoading = false
		}
	}

	async function resetPassword() {}

	// Handlers
	function handleRemove() {
		isOpenRemove = true
	}

	function handleResetPassword() {
		isResetFormShow = true
	}

	// Remove handlers
	function handleCloseRemove() {
		isOpenRemove = false
		isRemoveError = false
	}

	function handleAprovedRemove() {
		deleteAdmin()
	}

	// Reset password handlers
	function handleGenerateRandomPassword() {
		suggestedPassword =
			Math.random().toString(36).slice(2, 9) +
			Math.random().toString(36).toUpperCase().slice(2, 9)
	}

	function handleMatchPassword() {
		if (password !== rePassword) {
			isPasswordUnmatching = true
			return
		}
		isPasswordUnmatching = false
	}

	function handleSubmitPassword() {
		resetPassword()
	}

	function handleCancelPassword() {
		isResetFormShow = false
		password = ''
		rePassword = ''
	}
</script>

<section>
	<div class="max-w-md ml-[130px] mb-8">
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Admin full name:</p>
				<p>Admin role:</p>
				<p>Date joined:</p>
				<p>Admin email:</p>
				<p>Password:</p>
			</div>
			{#if isLoading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={5} />
				</div>
			{:else if admin}
				<div class="content">
					<p><span>{admin.name ?? '---'}</span> <span>{admin.surname ?? '---'}</span></p>
					<p>{admin.role ?? '---'}</p>
					<p>{admin.createdAt ? joinDate : '---'}</p>
					<p>{admin.email ?? '---'}</p>
					<p>************</p>
				</div>
			{/if}
		</div>
		{#if isResetFormShow}
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
					<div
						class="w-full flex justify-between items-center text-primary-purple font-dm"
					>
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
						on:blur={handleMatchPassword}
						label="Re-type password"
						type="password"
						bind:value={rePassword}
						placeholder="Re-type password"
						required
					/>
					{#if isPasswordUnmatching}
						<p class="text-sm font-medium text-alert-error font-dm rounded-lg py-2">
							Both password should be equal.
						</p>
					{/if}
					{#if isResetError}
						<p
							class="bg-alert-error text-sm font-medium text-white font-dm rounded-lg py-2 px-4"
						>
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
		{/if}
		{#if !isResetFormShow}
			<div class="grid grid-cols-2 place-content-between gap-x-12 gap-y-6">
				<MainButton>Change email</MainButton>
				<MainButton on:click={handleResetPassword}>Reset password</MainButton>
				<MainButton on:click={handleRemove}>Remove</MainButton>
				<MainButton>Make super admin</MainButton>
			</div>
		{/if}
	</div>
	<Modal isOpen={isOpenRemove} handleClose={handleCloseRemove} title="">
		<ApprovedModal
			text="Do you really want to remove this user?"
			yesButtonText={isRemoveLoading ? '...' : 'Yes'}
			isLoading={isRemoveLoading}
			onCancel={handleCloseRemove}
			onConfirm={handleAprovedRemove}
		/>
		{#if isRemoveError}
			<p class="bg-alert-error text-sm font-medium text-white font-dm rounded-lg py-2 px-4">
				An error has occurred, please try again.
			</p>
		{/if}
	</Modal>
</section>

<style lang="postcss">
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-5;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-5 max-w-[320px] md:max-w-none;
	}
</style>
