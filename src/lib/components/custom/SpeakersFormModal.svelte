<script lang="ts">
	// Svelte
	import { createEventDispatcher } from 'svelte'
	// Store
	import { page } from '$app/stores'
	import { pageAlert } from '$lib/stores/pageStatus'
	// Components
	import Modal from '../Modal.svelte'
	import SpeakerForm from './SpeakerForm.svelte'

	// props
	export let isOpen: boolean
	export let handleClose: () => void
	export let speaker: any = null
	export let loading: boolean = false

	const dispatch = createEventDispatcher()

	async function postSpeaker(speaker) {
		loading = true
		try {
			const res = await fetch(`${$page.url.origin}/api/speakers`, {
				method: 'POST',
				body: JSON.stringify({ ...speaker })
			})

			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Speaker added correctly.', status: true }
				dispatch('save', {
					...data
				})
				handleClose()
			} else {
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
				dispatch('error', {
					error: await res.json()
				})
				handleClose()
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
			dispatch('error', {
				error: error
			})
			handleClose()
		}
		loading = false
	}

	async function updateSpeaker(id, speaker) {
		loading = true
		try {
			const res = await fetch(`/api/speakers/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...speaker })
			})
			if (res.ok) {
				const data = await res.json()
				$pageAlert = { message: 'Success! Speaker updated correctly.', status: true }
				dispatch('save', {
					...data
				})
				handleClose()
			} else {
				console.log(await res.json())
				$pageAlert = {
					message: 'Oops! An error has occurred. try again later.',
					status: false
				}
			}
		} catch (error) {
			console.error('Error:', error)
			$pageAlert = { message: 'Oops! An error has occurred. try again later.', status: false }
			dispatch('save', {
				error: error
			})
			handleClose()
		}
		loading = false
	}
</script>

<Modal {isOpen} {handleClose}>
	<div class="flex flex-col items-center gap-5 py-5 px-12">
		<span class="pb-5">
			{'Create a speaker profile inside the event'}
		</span>
		<SpeakerForm
			addSpeaker={speaker}
			updateAction={speaker ? updateSpeaker : null}
			submitAction={postSpeaker}
		/>
	</div>
</Modal>
