<script>
	export let date
	export let size = 0
	export let className = ''

	const parsedDate = new Date(date)
	const month = parsedDate.getMonth()
	const day = parsedDate.getDate()

	const MONTHS = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	]
</script>

<div class={`w-14 h-14 flex justify-end bg-vertical-gradient rounded ${className}`}>
	<div
		class="w-[calc(100%-0.2rem)] h-full flex flex-col justify-center items-center bg-black rounded-r"
	>
		<span class="text-base @lg:text-2xl font-dm uppercase tracking-[2.6px] !leading-none"
			>{MONTHS[month]}</span
		>
		<span
			class="text-[clamp(24px,_3vw,_36px)] font-medium italic tracking-[0.7px] !leading-none"
			>{day}</span
		>
	</div>
</div>
