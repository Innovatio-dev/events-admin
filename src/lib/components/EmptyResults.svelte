<script lang="ts">
	import emptyImage from '$lib/images/empty.png'
	export let title: string
	export let text: string = ''
</script>

<div class="min-h-[40rem] w-full flex flex-col items-center justify-center text-center">
	<h2>
		{title}
	</h2>
	<p>{text}</p>
	<img class="object-cover" alt="empty.png" src={emptyImage} />
</div>
