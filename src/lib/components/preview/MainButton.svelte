<script lang="ts">
	export let title: string
	export let href: string | null = null
	export let handleClick: (() => void) | undefined = undefined
</script>

{#if href}
	<a {href} class="hover:no-underline">
		<button class="bgMavie">
			<div class="bgBlack">
				{title}
			</div>
		</button>
	</a>
{:else}
	<button class="bgMavie" on:click={handleClick}>
		<div class="bgBlack">
			{title}
		</div>
	</button>
{/if}

<style lang="postcss">
	.bgMavie {
		@apply flex items-center justify-center w-full h-full bg-gd-main rounded-xl p-[2px] my-4 lg:min-w-[600px];
	}
	.bgBlack {
		@apply flex items-center justify-center w-full h-full py-2 px-6 bg-black rounded-lg text-white;
	}
</style>
