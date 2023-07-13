<script>
	import ProfilePic from '../ProfilePic.svelte'
	import TrashButton from '../TrashButton.svelte'

	export let image
</script>

<div class="w-full flex justify-center items-center text-neutral-4">
	<div class="flex flex-col justify-center gap-5">
		<!-- <span class="font-semibold">
			{'Organizer Photo'}
		</span> -->
		<div class='w-full flex justify-center'>
			<div class="w-32  h-32 min-w-[8rem]">
				<ProfilePic img={image} />
			</div>
		</div>
		<div class="flex items-center justify-center gap-5">
			<span class='font-light'>
				{image.slice(0, 20) + '...'}
			</span>
			<TrashButton />
		</div>
	</div>
</div>
