<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import ChangeEmailAdminForm from '$lib/components/custom/ChangeEmailAdminForm.svelte'
	import ResetPasswordAdminForm from '$lib/components/custom/ResetPasswordAdminForm.svelte'
	import SimpleSkeleton from '$lib/components/skeletons/Skeleton.svelte'
	import { onMount } from 'svelte'

	// Admin data state
	let isLoading = false
	let isError = false
	let admin: any = null

	// Remove admin state
	let isRemoveLoading = false
	let isRemoveError = false
	let isOpenRemove = false

	// Reset password state
	let isResetFormShow = false

	// Change email state
	let isChangeFormShow = false

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

	// Handlers
	function handleRemove() {
		isOpenRemove = true
	}

	function handleResetPassword() {
		isResetFormShow = true
	}

	function handleCloseResetPassword() {
		isResetFormShow = false
	}

	function handleChangeEmail() {
		isChangeFormShow = true
	}

	function handleCloseChangeEmail() {
		isChangeFormShow = false
	}

	// Remove handlers
	function handleCloseRemove() {
		isOpenRemove = false
		isRemoveError = false
	}

	function handleAprovedRemove() {
		deleteAdmin()
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
			<ResetPasswordAdminForm onCancel={handleCloseResetPassword} />
		{/if}
		{#if isChangeFormShow}
			<ChangeEmailAdminForm onCancel={handleCloseChangeEmail} />
		{/if}
		{#if !isResetFormShow && !isChangeFormShow}
			<div class="grid grid-cols-2 place-content-between gap-x-12 gap-y-6">
				<MainButton on:click={handleChangeEmail}>Change email</MainButton>
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
