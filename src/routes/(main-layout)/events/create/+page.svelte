<script lang="ts">
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	import { onMount } from 'svelte'
	import EventForm from '$lib/components/custom/EventForm.svelte'

	onMount(() => {
		$pageStatus.title = 'Create an Event'
	})
</script>

<section>
	<EventForm />
</section>
