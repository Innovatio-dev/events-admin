<script lang="ts">
	import { Swiper, SwiperSlide } from 'swiper/svelte'
	import { EffectCoverflow, Navigation } from 'swiper'
	export let images
	import 'swiper/css'
	// Icons
	import Icon from 'svelte-icons-pack'
	import RiSystemArrowLeftSLine from 'svelte-icons-pack/ri/RiSystemArrowLeftSLine'
	import RiSystemArrowRightSLine from 'svelte-icons-pack/ri/RiSystemArrowRightSLine'
	import AiFillCamera from 'svelte-icons-pack/ai/AiFillCamera'
</script>

<div class="flex w-full mx-auto">
	<Swiper
		effect={'coverflow'}
		centeredSlides={true}
		spaceBetween={10}
		slidesPerView={1}
		grabCursor={true}
		navigation={{
			nextEl: '.next-photo',
			prevEl: '.prev-photo'
		}}
		loop={true}
		coverflowEffect={{
			rotate: 25,
			slideShadows: true,
			scale: 1.2
		}}
		modules={[EffectCoverflow, Navigation]}
		class="w-full h-fit @lg:h-[600px] relative"
	>
		{#each images as item}
			<SwiperSlide>
				<img
					src={item.url}
					alt={item.name}
					class="mx-auto object-cover w-full h-fit @md:h-[500px] @lg:h-[650px] rounded-lg"
				/>
			</SwiperSlide>
		{/each}
	</Swiper>
	<button
		class="flex items-center justify-end next-photo cursor-pointer absolute right-0 top-0 z-50 text-7xl h-[300px] @lg:h-full bg-black-gradient-r"
	>
		<Icon src={RiSystemArrowRightSLine} color={'#fff'} />
	</button>
	<button
		class="flex items-center justify-start prev-photo cursor-pointer absolute left-0 top-0 z-50 text-7xl h-[300px] @lg:h-full bg-black-gradient-l"
	>
		<Icon src={RiSystemArrowLeftSLine} color={'#fff'} />
	</button>
	<div
		class="flex items-center justify-center absolute @lg:bottom-24 bottom-20 !right-0 @lg:right-24 z-50 w-[140px] h-12 text-lg bg-brand-gray rounded-lg gap-x-2"
	>
		{images.length} Photos <Icon src={AiFillCamera} color={'#fff'} size={'1.5em'} />
	</div>
</div>
