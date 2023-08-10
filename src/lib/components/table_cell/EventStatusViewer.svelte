<script lang="ts">
	export let value: number
</script>

<div
	class={`w-6 group aspect-square rounded-full relative ease-in transition-all cursor-pointer`}
	class:draft={value == 0}
	class:published={value == 1}
	class:canceled={value == 2}
	class:suspended={value == 3}
>
	<div
		class="invisible shadow-tooltip group-hover:visible h-4 min-w-fit text-xs flex justify-center items-center bg-black absolute top-[-1.2rem] z-40 text-white rounded-lg px-2 ease-in transition-all"
	>
		{#if value == 0}
			{'Draft'}
		{:else if value == 1}
			{'Published'}
		{:else if value == 2}
			{'Cancelled'}
		{:else}
			{'Suspended'}
		{/if}
	</div>
	<div
		class="arrow ease-in transition-all top-[-.2rem] invisible group-hover:visible relative left-[.4rem]"
	/>
</div>

<style lang="scss">
	.draft {
		background-color: var(--alert-warning);
		box-shadow: 0px 4px 4px #ffe587;
	}
	.draft > :first-child {
		left: -50%;
	}
	.published {
		background-color: var(--alert-success);
		box-shadow: 0px 4px 4px #8bc510;
	}
	.published > :first-child {
		left: -110%;
	}
	.canceled {
		background-color: var(--alert-error);
		box-shadow: 0px 4px 4px #d33030;
	}
	.canceled > :first-child {
		left: -100%;
	}
	.suspended {
		background-color: var(--primary-purple);
		box-shadow: 0px 4px 4px #6750a3;
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
