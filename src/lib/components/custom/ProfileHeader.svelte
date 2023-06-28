<script lang="ts">
	import ProfilePic from '$lib/components/ProfilePic.svelte'

	export let organizerId: String
	export let requestDate: Date
	export let aproveDate: Date
	export let img: string
</script>

<div
	class="flex items-center gap-6 w-full text-neutral-4 font-light text-md tracking-[0.5px] relative"
>
	<div class="w-32 h-32 min-w-[8rem]">
		<ProfilePic img={img} />
	</div>
	<div class="flex gap-12">
		<div class="flex flex-col gap-5 font-semibold">
			<span>
				{'Organizer ID:'}
			</span>
			<span>
				{'Date of request:'}
			</span>
			<span>
				{'Aproved request:'}
			</span>
		</div>
		<div class="flex flex-col gap-5">
			<span>
				{organizerId}
			</span>
			<span>
				{requestDate.toLocaleDateString()}
			</span>
			<span>
				{aproveDate.toLocaleDateString()}
			</span>
		</div>
	</div>
</div>
