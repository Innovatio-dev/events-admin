<script lang="ts">
	export let value: any
</script>

<div class="main-container">
	<div class="text">{value.title}</div>
	{#if value.image}
		<div class="image">
			<img alt={value.title} src={value.image} />
		</div>
	{/if}
</div>

<style lang="scss">
	.main-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8em;

		padding: 0em 0.8em;
		.text {
			flex-grow: 1;
		}
		.image {
			width: 2em;
			height: 2em;
			overflow: hidden;
			border-radius: 50%;
			position: relative;
			&::after {
				opacity: 1;
				background: var(--gd-linear);
				border-radius: 50%;
				content: '';
				inset: 0;
				padding: 1px;
				position: absolute;
				z-index: 2;
				-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
				mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
				-webkit-mask-composite: xor;
				mask-composite: exclude;
			}
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
</style>
