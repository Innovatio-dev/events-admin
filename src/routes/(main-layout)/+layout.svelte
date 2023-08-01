<script>
	// @ts-nocheck
	import '../styles.css'
	import logo from '$lib/images/logo.svg'
	import mavieDoted from '$lib/images/mavie-doted.png'
	import SideBarMenu from '$lib/components/SideBarMenu.svelte'
	import Alert from '$lib/components/Alert.svelte'

	import { page } from '$app/stores'

	import Add from '$lib/components/icons/Add.svelte'
	import Request from '$lib/components/icons/Request.svelte'
	import User from '$lib/components/icons/User.svelte'
	import Ticket from '$lib/components/icons/Ticket.svelte'
	import Mic from '$lib/components/icons/Mic.svelte'
	import Bank from '$lib/components/icons/Bank.svelte'
	import Checklist from '$lib/components/icons/Checklist.svelte'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import BreadCrumb from '$lib/components/BreadCrumb.svelte'
	import { pageStatus, pageAlert } from '$lib/stores/pageStatus'
	import Popup from '$lib/components/Popup.svelte'
	import SimpleList from '$lib/components/SimpleList.svelte'
	import AiOutlineUser from 'svelte-icons-pack/ai/AiOutlineUser'
	import AiOutlineLogout from 'svelte-icons-pack/ai/AiOutlineLogout'
	import TextWithIcon from '$lib/components/table_cell/TextWithIcon.svelte'
	export let data

	let expandedMenu = true
	let floatingMenu = false
	let showAlert = false

	const renderAlert = () => {
		const alert = $pageAlert.message
		if (alert) {
			setTimeout(() => {
				showAlert = true
			}, 200)
			setTimeout(() => {
				showAlert = false
				$pageAlert = { message: null, status: false }
				// console.log($pageAlert)
			}, 5000)
		}
	}

	$: $pageAlert, renderAlert()

	let menuPopup
	let avatarLogo

	const items = [
		{ path: '/events/create', name: 'Create a event', icon: Add },
		{ path: '/organizer-requests', name: 'Organizer requests', icon: Request },
		{ path: '/organizers', name: 'Organizer list', icon: User },
		{ path: '/events', name: 'View events', icon: Ticket },
		{ path: '/speakers', name: 'Speaker list', icon: Mic },
		{ path: '/venues', name: 'Venue list', icon: Bank },
		{ path: '/admin', name: 'Admin panel', icon: Checklist }
	]

	if (data.user.role !== 1) {
		items.pop()
	}

	let activeIndex = null

	function updateIndex() {
		activeIndex = items.reduce(
			(acc, item, index) => {
				if (
					$page.url.pathname === item.path ||
					($page.url.pathname.startsWith(item.path) &&
						item.path.length > (acc.item ? acc.item.path.length : 0)) ||
					($page.url.pathname.startsWith(item.path + '/') &&
						item.path.length === (acc.item ? acc.item.path.length : 0))
				) {
					return { index, item }
				} else {
					return acc
				}
			},
			{ index: -1, item: null }
		).index
	}
	afterNavigate(() => {
		updateIndex()
	})
	beforeNavigate(() => {
		$pageStatus = { title: null, status: null }
	})
</script>

<div class="app">
	<header
		class="bg-gd-navbar h-[64px] text-[white] flex justify-between items-center px-8 py-[20px] relative"
	>
		<img class="h-[24px]" src={logo} alt="logo" />
		<div class="profile h-full flex items-center gap-4">
			{#if data.user}
				<span>
					{data.user.name}
				</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					bind:this={avatarLogo}
					on:click={() => menuPopup.show()}
					class="rounded-full overflow-hidden h-[44px] aspect-square cursor-pointer"
				>
					<img
						class="w-full h-full"
						alt="avatar"
						src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
							data.user.name + data.user.surname
						)}&background=0D8ABC&color=fff`}
					/>
				</div>
				<Popup bind:this={menuPopup} desiredWidth="200px" trigger={avatarLogo}>
					<SimpleList
						itemViewer={TextWithIcon}
						items={[
							// {
							// 	text: 'Profile',
							// 	icon: AiOutlineUser
							// },
							{
								text: 'Log out',
								icon: AiOutlineLogout
							}
						]}
					/>
				</Popup>
			{:else}
				<a href="/signin">
					<span>Sign in</span>
				</a>
			{/if}
		</div>
	</header>
	<div class="h-[calc(100vh-64px)] bg-gd-page relative overflow-hidden">
		<div class="absolute bottom-0 left-[-200px] tranform rotate-[50deg]">
			<img src={mavieDoted} width="500px" alt="maviedoted" />
		</div>
		<div class="absolute top-[200px] right-[-250px] tranform rotate-[-70deg]">
			<img src={mavieDoted} width="500px" alt="maviedoted" />
		</div>
		<SideBarMenu
			{items}
			bind:expanded={expandedMenu}
			bind:floating={floatingMenu}
			expandedWidth={250}
			collapsedWidth={70}
			floatingBreakpoint={600}
			selectedIndex={activeIndex}
		/>
		<div class="content" class:expanded={expandedMenu}>
			<BreadCrumb />
			<slot />
		</div>
	</div>
	{#if showAlert}
		<Alert />
	{/if}
	<footer />
</div>

<style lang="scss">
	.content {
		padding-bottom: 3rem;
		position: absolute;
		left: 70px;
		top: 0;
		bottom: 0;
		right: 0;
		transition: all 0.2s ease-in-out;
		overflow-y: scroll;
		&.expanded {
			left: 250px;
		}
	}
</style>
