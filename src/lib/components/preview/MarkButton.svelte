<script lang="ts">
	export let text: string = 'Click me'
</script>

<button class="container">
	<div class="firstRing" />
	<div class="secondRing" />
	<div class="thirdRing" />
	<div class="content">{text}</div>
</button>

<style lang="postcss">
	.container {
		@apply w-full lg:w-auto min-w-fit lg:max-w-fit bg-gd-main p-[1px] rounded-full relative;
	}

	.container::after {
		@apply w-[calc(100%-2px)] h-[calc(100%-2px)] bg-black top-[1px] left-[1px] rounded-full transition-all ease-in-out absolute;
		content: '';
	}

	.container:hover::after {
		@apply bg-[transparent];
	}

	.container:hover .firstRing {
		@apply opacity-0;
	}

	.container:hover .secondRing {
		@apply opacity-0;
	}

	.container:hover .thirdRing {
		@apply opacity-0;
	}

	.container:hover .content {
		@apply text-black;
	}

	.firstRing {
		@apply w-[calc(100%-10px)] h-[calc(100%-2px)] bg-gd-main opacity-50 rounded-full transition-all ease-in-out absolute right-1/2 translate-x-1/2 z-10;
	}

	.firstRing::after {
		@apply w-[calc(100%-2px)] h-[calc(100%-2px)] bg-black top-[1px] left-[1px] rounded-full absolute;
		content: '';
	}

	.secondRing {
		@apply w-[calc(100%-20px)] h-[calc(100%-4px)] bg-gd-main opacity-20 rounded-full transition-all ease-in-out absolute top-[2px] right-1/2 translate-x-1/2 z-10;
	}

	.secondRing::after {
		@apply w-[calc(100%-2px)] h-[calc(100%-2px)] bg-black top-[1px] left-[1px] rounded-full absolute;
		content: '';
	}

	.thirdRing {
		@apply w-[calc(100%-30px)] h-[calc(100%-6px)] bg-gd-main opacity-10 rounded-full transition-all ease-in-out absolute top-[3px] right-1/2 translate-x-1/2 z-10;
	}

	.thirdRing::after {
		@apply w-[calc(100%-2px)] h-[calc(100%-2px)] bg-black top-[1px] left-[1px] rounded-full absolute;
		content: '';
	}

	.content {
		@apply w-full h-full rounded-full transition-all ease-in-out relative z-10 flex items-center justify-center px-5 py-2;
	}
</style>
