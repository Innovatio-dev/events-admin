<script lang="ts">
	import ProfilePic from '../ProfilePic.svelte'
	import SimpleSkeleton from '../skeletons/Skeleton.svelte'
	export let organizer: any
	export let loading: any
	$: image =
		organizer && organizer.logo
			? organizer.logo.url
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(
					organizer && organizer.name ? organizer.name : ''
			  )}&background=0D8ABC&color=fff`
</script>

<div class="grid grid-cols-1 md:grid-cols-2">
	<!-- Profile Data -->
	<div class="flex w-[400px] h-fit gap-y-4">
		{#if loading}
			<div class="absolute">
				<SimpleSkeleton width={130} height={130} circle />
			</div>
		{:else if organizer}
			<div class="absolute w-[130px] h-[130px]">
				<ProfilePic img={image} />
			</div>
		{/if}
		<div class="grid grid-cols-2 px-8 ml-[130px] min-w-[400px] mb-8">
			<div class="field">
				<p>OrganizerID :</p>
				<p>Date of Request :</p>
				{#if organizer?.status == 1}
					<p>Approved Date :</p>
				{/if}
				{#if organizer?.status == 2}
					<p>Denied Date :</p>
				{/if}
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={3} />
				</div>
			{:else if organizer}
				<div class="content">
					<p>{organizer.uid ?? '---'}</p>
					<p>{new Date(organizer.createdAt).toLocaleDateString().split('/').join('/')}</p>
					{#if organizer?.status != 0}
						<p>
							{new Date(organizer.createdAt)
								.toLocaleDateString()
								.split('/')
								.join('/')}
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<!-- Contact Data -->
	<div class="flex flex-col w-[400px] h-fit gap-y-4">
		<h3>Organizer Contact</h3>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>phone</p>
				<p>organizer email</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={2} />
				</div>
			{:else if organizer}
				<div class="content">
					<p>{organizer.phone ?? '---'}</p>
					<p>{organizer.email ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- General Data -->
	<div class="flex flex-col w-[400px] h-fit gap-y-4">
		<h3>General Information</h3>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>Full name</p>
				<p>regions</p>
				<p>organizer country</p>
				<p>mavie member</p>
				<p>mavie id</p>
				<p>organizer company</p>
				<p>website</p>
				<p>description</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton width={200} height={20} items={8} />
				</div>
			{:else if organizer}
				<div class="content">
					<p>{organizer.name ?? '---'}</p>
					<p>{organizer?.regions.map((region) => region.name).join(', ')}</p>
					<p>{organizer.country.name ?? '---'}</p>
					<p>{organizer.mavieId ? 'Yes' : 'No'}</p>
					<p>{organizer.mavieId ?? '---'}</p>
					<p>{organizer.company ?? '---'}</p>
					<p>{organizer.website ?? '---'}</p>
					<p>{organizer.description ?? '---'}</p>
				</div>
			{/if}
		</div>
	</div>
	<!-- Social Media -->
	<div class="flex flex-col w-[400px] h-fit gap-y-4">
		<h3>Organizer Social Media</h3>
		<div class="grid grid-cols-2 min-w-[400px] mb-8">
			<div class="field">
				<p>facebook</p>
				<p>twitter</p>
				<p>linkedIn</p>
				<p>instagram</p>
				<p>Youtube</p>
			</div>
			{#if loading}
				<div class="w-full h-full flex">
					<SimpleSkeleton wFull height={20} items={5} />
				</div>
			{:else if organizer}
				<div class="content">
					<p>
						{organizer.facebook?.substring(organizer.facebook.lastIndexOf('/') + 1) ??
							'---'}
					</p>
					<p>
						{organizer.twitter?.substring(organizer.twitter.lastIndexOf('/') + 1) ??
							'---'}
					</p>
					<p>
						{organizer.linkedin?.substring(organizer.linkedin.lastIndexOf('/') + 1) ??
							'---'}
					</p>
					<p>
						{organizer.instagram?.substring(organizer.instagram.lastIndexOf('/') + 1) ??
							'---'}
					</p>
					<p>
						{organizer.youtube?.substring(organizer.youtube.lastIndexOf('/') + 1) ??
							'---'}
					</p>
				</div>
			{/if}
		</div>
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
