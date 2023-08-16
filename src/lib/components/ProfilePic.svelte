<script lang="ts">
	export let img: string = ''
	export let maxSize: string = ''
</script>

<div
	class={`relative w-full h-full max-h-[${maxSize}px] max-w-[${maxSize}px] rounded-full overflow-hidden`}
>
	<img class="object-contain h-full" src={img} alt="" />
</div>

<style>
	div {
		display: inline-block;
		border: 3px dashed #fff;
		background: linear-gradient(#fff 0 0) padding-box, var(--gd-main) border-box;
	}
</style>
