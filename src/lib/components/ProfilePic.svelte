<script>
	export let img = ''
</script>

<div class="relative w-full h-full rounded-full overflow-hidden">
	<img class="object-cover h-full" src={img} alt="" />
</div>

<style>
	div {
		display: inline-block;
		border: 3px dashed #fff;
		background: linear-gradient(#fff 0 0) padding-box, var(--gd-main) border-box;
	}
</style>
