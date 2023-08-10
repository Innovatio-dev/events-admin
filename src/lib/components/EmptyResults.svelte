<script>
	import emptyImage from '$lib/images/empty.png'
	export let title
</script>

<div class="min-h-[40rem] w-full flex flex-col items-center justify-center text-center">
	<h2>
		{title}
	</h2>
	<img class="object-cover" alt="empty.png" src={emptyImage} />
</div>
