<script lang="ts">
	export let wFull: boolean = false
	export let hFull: boolean = false
	export let width: number | null = null
	export let height: number | null = null
	export let circle: boolean = false
	export let items: number = 1
	export let bg: string = 'neutral-2'
</script>

<div class="flex flex-col w-full h-full justify-around">
	{#each Array(items) as _, i}
		<div
			class={`animate-pulse bg-${bg} ${circle ? 'rounded-[50%]' : 'rounded-md'}`}
			style={`
				width: ${wFull ? 'full' : `${width}px`}; 
				height: ${hFull ? '100%' : `${height}px`};
			`}
		/>
	{/each}
</div>
