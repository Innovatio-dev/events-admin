<script lang="ts">
	export let value: number
</script>

<div
	class={`w-6 group aspect-square rounded-full relative ease-in transition-all cursor-pointer`}
	class:inactive={value == 0}
	class:active={value == 1}
	class:suspended={value == 2}
>
	<div
		class="invisible shadow-tooltip group-hover:visible h-4 min-w-fit text-xs flex justify-center items-center bg-black absolute top-[-1.2rem] left-[-80%] z-40 text-white rounded-lg px-2 ease-in transition-all"
	>
		{#if value == 0}
			{'Pending'}
		{/if}
		{#if value == 1}
			{'Approved'}
		{/if}
		{#if value == 2}
			{'Dennied'}
		{/if}
	</div>
	<div
		class="arrow ease-in transition-all top-[-.2rem] invisible group-hover:visible relative left-[.4rem]"
	/>
</div>

<style lang="scss">
	.inactive {
		background-color: var(--alert-warning);
		box-shadow: 0px 4px 4px rgba(255, 229, 135, 0.4);
	}
	.active {
		background-color: var(--alert-success);
		box-shadow: 0px 4px 4px rgba(24, 171, 53, 0.6);
	}
	.suspended {
		background-color: var(--alert-error);
		box-shadow: 0px 4px 4px rgb(171 92 24 / 60%);
	}
	.arrow {
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid black;
	}
</style>
