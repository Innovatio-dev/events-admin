<script lang="ts">
	export let value: number
</script>

<div
	class={`w-6 group aspect-square rounded-full relative ease-in transition-all cursor-pointer`}
	class:active={value == 0}
	class:suspended={value == 1}
>
	<div
		class="invisible shadow-tooltip group-hover:visible h-4 min-w-fit text-xs flex justify-center items-center bg-black absolute top-[-1.2rem] z-40 text-white rounded-lg px-2 ease-in transition-all"
	>
		{#if value == 0}
			{'Active'}
		{:else}
			{'Suspended'}
		{/if}
	</div>
	<div
		class="arrow ease-in transition-all top-[-.2rem] invisible group-hover:visible relative left-[.4rem]"
	/>
</div>

<style lang="scss">
	.active {
		background-color: var(--alert-success);
		box-shadow: 0px 4px 4px #8bc510;
	}
	.active > :first-child {
		left: -60%;
	}
	.suspended {
		background-color: var(--alert-error);
		box-shadow: 0px 4px 4px #d33030;
	}
	.suspended > :first-child {
		left: -110%;
	}
	.arrow {
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid black;
	}
</style>
