<script>
	import OrganizerForm from '$lib/components/custom/OrganizerForm.svelte'
	import { pageStatus } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'

	onMount(() => {
		$pageStatus.title = 'Register a New Organizer'
	})
</script>

<section class="w-full flex justify-center">
	<div class="py-12">
		<OrganizerForm />
	</div>
</section>
