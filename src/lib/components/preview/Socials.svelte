<script lang="ts">
	export let speaker
	export let color
	// Icons
	import Icon from 'svelte-icons-pack'
	import BiLogoFacebookCircle from 'svelte-icons-pack/bi/BiLogoFacebookCircle'
	import BiLogoInstagramAlt from 'svelte-icons-pack/bi/BiLogoInstagramAlt'
	import BiLogoTwitter from 'svelte-icons-pack/bi/BiLogoTwitter'
	import AiFillLinkedin from 'svelte-icons-pack/ai/AiFillLinkedin'
	import FiYoutube from 'svelte-icons-pack/fi/FiYoutube'
</script>

<div class="flex items-center gap-2 w-fit">
	{#if speaker.facebook}
		<a href={`https://www.facebook.com/${speaker.facebook}`}>
			<Icon src={BiLogoFacebookCircle} className="!w-6 h-6" {color} />
		</a>
	{/if}
	{#if speaker.instagram}
		<a href={`https://www.instagram.com/${speaker.instagram}`}>
			<Icon src={BiLogoInstagramAlt} className="w-6 h-6" {color} />
		</a>
	{/if}
	{#if speaker.twitter}
		<a href={`https://www.twitter.com/${speaker.twitter}`}>
			<Icon src={BiLogoTwitter} className="w-6 h-6" {color} />
		</a>
	{/if}
	{#if speaker.linkedin}
		<a href={`https://www.linkedin.com/${speaker.linkedin}`}>
			<Icon src={AiFillLinkedin} className="w-6 h-6" {color} />
		</a>
	{/if}
	{#if speaker.youtube}
		<a href={`https://www.youtube.com/${speaker.youtube}`}>
			<Icon src={FiYoutube} className="w-6 h-6" {color} />
		</a>
	{/if}
</div>
