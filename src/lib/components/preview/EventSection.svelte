<script>
	export let title
</script>

<div class="w-full h-fit flex flex-col gap-10">
	<div class="w-fit h-fit flex flex-col gap-1">
		<p class="w-fit text-3xl tracking-[0.5px] font-[500] font-eesti">{title}</p>
		<span class="w-auto h-1 bg-gd-main" />
	</div>
	<div class="w-full lg:w-[calc(100%-2rem)] lg:ml-8">
		<slot />
	</div>
</div>
