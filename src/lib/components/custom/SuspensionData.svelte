<script lang="ts">
	// Components
	import SimpleSkeleton from '../skeletons/Skeleton.svelte'

	export let logData: any
	export let loading: any
</script>

<div class="flex flex-col w-[400px] h-fit gap-y-4">
	<h3>Suspension details:</h3>
	<div class="grid grid-cols-2 min-w-[400px] mb-8">
		<div class="field">
			<p>Date suspension:</p>
			<p>Past suspension:</p>
			<p>Reason for suspension:</p>
		</div>
		{#if loading}
			<div class="w-full h-full flex">
				<SimpleSkeleton width={200} height={20} items={3} />
			</div>
		{:else if logData}
			<div class="content">
				<p>
					{new Date(logData[logData.length - 1].updatedAt)
						.toLocaleDateString()
						.split('/')
						.join('/')}
				</p>
                <div class='flex gap-3'>

                    {#each logData as suspend}
                        <p>
                            {'S: '}
                            {new Date(suspend.createdAt).toLocaleDateString().split('/').join('/')}
                        </p>
                    {/each}
                </div>
				<p>{logData[logData.length - 1].reason}</p>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.field p {
		@apply text-neutral-4 font-dm capitalize w-[180px] py-2;
	}
	.content p {
		@apply text-neutral-3 font-thin font-eesti min-w-fit w-[360px] py-2 max-w-[320px] md:max-w-none;
	}
</style>
