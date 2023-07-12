<script>
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	// Components
	import Input from '$lib/components/Input.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import SecondaryButton from '$lib/components/SecondaryButton.svelte'
	import ToggleButtton from '$lib/components/ToggleButtton.svelte'
	// Icons
	import Icon from 'svelte-icons-pack'
	import BiRevision from 'svelte-icons-pack/bi/BiRevision'

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
			const res = await fetch(`${$page.url.origin}/api/admins`, {
				method: 'POST',
				body: JSON.stringify({ ...admin })
			})

			if (res.ok) {
				await res.json()
				goto('/admin')
			} else {
				console.log(await res.json())
			}
		} catch (error) {
			console.error('Error:', error)
		}
	}
</script>

<section class="mb-20">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-full max-w-2xl flex flex-col gap-8 mx-auto"
	>
		<Input label="Name" type="text" bind:value={admin.name} placeholder="Type the name" />
		<Input
			label="Surname"
			type="text"
			bind:value={admin.surname}
			placeholder="Type the surname"
		/>
		<Input label="Email" type="text" bind:value={admin.email} placeholder="Type the email" />
		<div class="w-full flex justify-between items-center">
			<p>Generate a new random password</p>
			<div class="w-40">
				<MainButton on:click={generateRandomPassword}>
					<Icon size="22px" src={BiRevision} />
					<span>Generate</span>
				</MainButton>
			</div>
		</div>
		<Input
			label="Password"
			type="password"
			bind:value={admin.password}
			placeholder="***********"
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

		<div class="w-full flex items-center gap-8">
			<SecondaryButton>Create</SecondaryButton>
			<MainButton>Cancel</MainButton>
		</div>
	</form>
</section>
