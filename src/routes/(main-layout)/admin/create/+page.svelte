<script>
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import ToggleButtton from '$lib/components/ToggleButtton.svelte'
	// Icons
	import Icon from 'svelte-icons-pack'
	import BiRevision from 'svelte-icons-pack/bi/BiRevision'

	let isLoading = false
	let isError = false

	let admin = {
		name: '',
		surname: '',
		email: '',
		password: '',
		superadmin: false
	}

	let suggestedPassword = ''

	function generateRandomPassword() {
		suggestedPassword =
			Math.random().toString(36).slice(2, 9) +
			Math.random().toString(36).toUpperCase().slice(2, 9)
	}

	async function handleSubmit() {
		try {
			isLoading = true
			isError = false

			const { superadmin, ...restAdmin } = admin
			const payload = {
				role: superadmin ? 1 : 2,
				...restAdmin
			}
			const res = await fetch(`${$page.url.origin}/api/admins`, {
				method: 'POST',
				body: JSON.stringify({ ...payload })
			})

			if (res.ok) {
				await res.json()
				goto('/admin')
			} else {
				console.log(await res.json())
				isError = true
			}
		} catch (error) {
			console.error('Error:', error)
			isError = true
		} finally {
			isLoading = false
		}
	}
</script>

<section class="mb-20">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-full max-w-2xl flex flex-col gap-8 mx-auto"
	>
		<Input
			label="Name"
			type="text"
			bind:value={admin.name}
			placeholder="Type the name"
			required
		/>
		<Input
			label="Surname"
			type="text"
			bind:value={admin.surname}
			placeholder="Type the surname"
			required
		/>
		<Input
			label="Email"
			type="email"
			bind:value={admin.email}
			placeholder="Type the email"
			required
		/>
		<div class="w-full flex justify-between items-center">
			<p>Generate a new random password</p>
			<div class="w-40">
				<button
					type="button"
					class="hover:bg-gd-icon hover:!text-white hover:!fill-white hover:border-neutral-1 border-2 border-neutral-2 text-neutral-4 fill-neutral-4 p-2 flex w-full justify-evenly gap-2 rounded-lg font-medium transition-all ease-in-out px-4 py-2 items-center"
					on:click={generateRandomPassword}
				>
					<Icon size="22px" src={BiRevision} />
					<span>Generate</span>
				</button>
			</div>
		</div>
		<Input
			label="Password"
			type="password"
			bind:value={admin.password}
			placeholder="***********"
			required
		/>
		{#if suggestedPassword !== ''}
			<div class="w-full flex justify-between items-center text-primary-purple font-dm">
				<span>{suggestedPassword}</span>
				<span class="text-sm font-medium">Suggested</span>
			</div>
		{/if}

		<div class="w-full flex flex-col gap-2">
			<span class="text-neutral-4 font-normal text-sm tracking-[0.5px]">Is super admin?</span>
			<div class="w-fit">
				<ToggleButtton
					bind:checked={admin.superadmin}
					id="tid1"
					text
					right="Yes"
					left="No"
				/>
			</div>
		</div>

		{#if isError}
			<p class="bg-alert-error text-sm font-medium text-white font-dm rounded-lg py-2 px-4">
				An error has occurred, please try again.
			</p>
		{/if}

		<div class="w-full grid grid-cols-2 gap-8">
			<MainButton loading={isLoading}>Create</MainButton>
			<MainButton href="/admin">Cancel</MainButton>
		</div>
	</form>
</section>
