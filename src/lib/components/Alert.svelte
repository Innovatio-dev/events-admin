<script lang="ts">
	// Animations
	import { fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	// Icons
	import Icon from 'svelte-icons-pack'
	import FiCheckCircle from 'svelte-icons-pack/fi/FiCheckCircle'
	import FiAlertCircle from 'svelte-icons-pack/fi/FiAlertCircle'
	// Store
	import { pageAlert } from '$lib/stores/pageStatus'

	const message = $pageAlert.message ?? ''
	const status = $pageAlert.status ?? ''
</script>

<div
	in:fly={{ delay: 250, duration: 300, y: -200, opacity: 0.5, easing: quintOut }}
	out:fly={{ delay: 250, duration: 600, y: -200, opacity: 0.5, easing: quintOut }}
	class="fixed top-12 flex w-full justify-center z-50"
>
	<div
		class="flex gap-2 items-center p-3 mb-4 text-sm text-white rounded-full bg-black"
		role="alert"
	>
		{#if status}
			<Icon src={FiCheckCircle} size="20px" color="var(--alert-success)" />
		{:else}
			<Icon src={FiAlertCircle} size="20px" color="var(--alert-warning)" />
		{/if}
		<span class="sr-only">Info</span>
		<div>
			<span class="font-medium">{message}</span>
		</div>
	</div>
</div>
