<script lang="ts">
	export let title: string
	export let href: string | null = null
	export let handleClick: (() => void) | undefined
	export let isDisabled: boolean = false
</script>

{#if href}
	<a {href}>
		<button class="bgBlack" disabled={isDisabled}>
			<div class="bgBlack">
				{title}
			</div>
		</button>
	</a>
{:else}
	<button class="bgMavie" on:click={handleClick} disabled={isDisabled}>
		<div class="bgBlack">
			{title}
		</div>
	</button>
{/if}

<style lang="postcss">
	.bgMavie {
		@apply flex items-center justify-center w-full h-full bg-gd-main rounded-lg p-[2px] my-4;
	}
	.bgBlack {
		@apply flex items-center justify-center w-full h-full py-2 px-6 bg-black rounded-md;
	}
</style>
