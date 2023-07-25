<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import BsCalendar3 from 'svelte-icons-pack/bs/BsCalendar3'
	import AiOutlineClockCircle from 'svelte-icons-pack/ai/AiOutlineClockCircle'
	export let dateString: any

	function getFormattedTime(dateString: string) {
		const dateObj = new Date(dateString)
		const options = { hour: '2-digit', minute: '2-digit', hour12: true }
		return dateObj.toLocaleString('en-US', options)
	}

	function getFormattedDate(dateString: string) {
		const dateObj = new Date(dateString)
		const options = {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			weekday: 'long' as const
		}
		return dateObj.toLocaleString('en-US', options)
	}

	let time = getFormattedTime(dateString)
	let dateFormatted = getFormattedDate(dateString)
</script>

<div class="flex gap-x-5">
	<div class="flex gap-x-2 items-center">
		<Icon src={BsCalendar3} color="#fff" size="1.3em" />
		<p>{dateFormatted}</p>
	</div>
	<div class="flex gap-x-2 items-center">
		<Icon src={AiOutlineClockCircle} color="#fff" size="1.5em" />
		<p>{time}</p>
	</div>
</div>
