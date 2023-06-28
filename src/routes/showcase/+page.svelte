<script lang="ts">
	import Badge from '$lib/components/Badge.svelte'
	import FlagBadge from '$lib/components/FlagBadge.svelte'
	import MainButton from '$lib/components/MainButton.svelte'
	import SecondaryButton from '$lib/components/SecondaryButton.svelte'
	import AiOutlineUser from 'svelte-icons-pack/ai/AiOutlineUser'
	import FaBrandsXbox from 'svelte-icons-pack/fa/FaBrandsXbox'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import SideBarMenu from '$lib/components/SideBarMenu.svelte'
	import ApprovedModal from '$lib/components/ApprovedModal.svelte'

	import { page } from '$app/stores'

	// Constants
	import { FLAG_BADGES, BADGES } from '$lib/utils/constants/Showcase'
	// Icons
	import Icon from 'svelte-icons-pack/Icon.svelte'
	import BiEditAlt from 'svelte-icons-pack/bi/BiEditAlt'
	import Input from '$lib/components/Input.svelte'
	import { passwordSchema } from '$lib/utils/validation/schemas'
	import ToggleButtton from '$lib/components/ToggleButtton.svelte'
	import DragAndDrop from '$lib/components/DragAndDrop.svelte'
	import BreadCrumb from '$lib/components/BreadCrumb.svelte'
	import SortableList from '$lib/components/SortableList.svelte'
	import Request from '$lib/components/icons/Request.svelte'
	import User from '$lib/components/icons/User.svelte'
	import Ticket from '$lib/components/icons/Ticket.svelte'
	import Mic from '$lib/components/icons/Mic.svelte'
	import Bank from '$lib/components/icons/Bank.svelte'
	import Checklist from '$lib/components/icons/Checklist.svelte'
	import Add from '$lib/components/icons/Add.svelte'

	import { onMount } from 'svelte'

	// Modal
	let isOpen = false
	const handleOpenModal = () => {
		isOpen = true
	}
	const handleCloseModal = () => {
		isOpen = false
	}
	// Modal
	let isOpenApproved = false
	const handleOpenModalApproved = () => {
		isOpenApproved = true
	}
	const handleCloseModalApproved = () => {
		isOpenApproved = false
	}
	// Modal
	let isOpenDenied = false
	const handleOpenModalDenied = () => {
		isOpenDenied = true
	}
	const handleCloseModalDenied = () => {
		isOpenDenied = false
	}

	let Modal: any

	onMount(async () => {
		Modal = (await import('$lib/components/Modal.svelte')).default
	})

	let expandedMenu = true
	let floatingMenu = false

	const items = [
		{ path: '/event/create', name: 'Create a event', icon: Add },
		{ path: '/requests', name: 'Organizer request', icon: Request },
		{ path: '/organizers', name: 'Organizer list', icon: User },
		{ path: '/events', name: 'View events', icon: Ticket },
		{ path: '/speakers', name: 'Speaker list', icon: Mic },
		{ path: '/venues', name: 'Venue list', icon: Bank },
		{ path: '/admin', name: 'Admin panel', icon: Checklist }
	]
	const activeIndex = items.reduce(
		(acc: any, item: any, index: any) => {
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
</script>

<div class="w-full gap-10 flex flex-col items-center p-8">
	{'Showcase'}
	<div class="flex items-center gap-10">
		{'Badges'}
		{#each BADGES as badge (badge.id)}
			<Badge type={badge.type}>{'badge'}</Badge>
		{/each}
	</div>
	<div class="flex items-center gap-10">
		{'Flag Badges'}
		{#each FLAG_BADGES as flagBadge (flagBadge.id)}
			<FlagBadge flag={flagBadge.flag} label={flagBadge.label} />
		{/each}
	</div>
	<div class="flex items-center gap-10">
		{'Primary Button'}
		<div>
			<MainButton>
				<Icon className="h-6 w-6" src={BiEditAlt} />
				{'Primary'}
			</MainButton>
		</div>
	</div>
	<div class="flex items-center gap-10">
		{'Secondary Button'}
		<div>
			<SecondaryButton>
				{'Secondary'}
			</SecondaryButton>
		</div>
	</div>
	<div class="flex items-center gap-10">
		{'Modal'}
		<SecondaryButton on:click={handleOpenModal}>
			{'Open Modal'}
		</SecondaryButton>
		<svelte:component this={Modal} {isOpen} handleClose={handleCloseModal} title="title">
			<div class="w-96 flex flex-col items-center">
				<p class="my-4">This is an example modal.</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus est error
					consectetur. Ipsa nemo, enim animi architecto inventore similique
					exercitationem, atque quasi temporibus accusantium fuga ullam quod ipsum ab
					repellendus.
				</p>
			</div>
		</svelte:component>
	</div>
	<div class="flex items-center gap-10">
		<SecondaryButton on:click={handleOpenModalApproved}>
			{'Approved Request Modal'}
		</SecondaryButton>
		<svelte:component
			this={Modal}
			isOpen={isOpenApproved}
			handleClose={handleCloseModalApproved}
		>
			<div class="max-w-[30rem] flex flex-col items-center">
				<ApprovedModal
					onCancel={() => (isOpenApproved = false)}
					onConfirm={() => console.log('confirmed')}
				/>
			</div>
		</svelte:component>
	</div>
	<div class="flex items-center gap-10">
		{'Menu'}
		<SideBarMenu
			{items}
			bind:expanded={expandedMenu}
			bind:floating={floatingMenu}
			expandedWidth={250}
			collapsedWidth={70}
			floatingBreakpoint={600}
			selectedIndex={activeIndex}
		/>
	</div>
	<div class="flex items-center gap-10 py-20">
		{'Sortable List'}
		<div class="w-[40rem]">
			<SortableList />
		</div>
	</div>
	<div class="flex items-center gap-4 justify-center flex-col w-96">
		<Input type="text" label={'Username'}>
			<Icon slot="trailing" src={AiOutlineUser} />
		</Input>
		<Input
			type="password"
			name="password"
			label="Password"
			placeholder="Type your new password"
			validationSchema={passwordSchema}
		/>
	</div>
	<div class="flex items-center gap-10 z-50">
		<Dropdown
			width="100%"
			items={[
				{
					value: 'juan',
					title: 'Juan'
				},
				{
					value: 'juan',
					title: 'Hebert'
				}
			]}
		>
			<span slot="title"> Speaker</span>
			<Icon src={AiOutlineUser} slot="leading" color="currentColor" size="100%" />
		</Dropdown>
		<Dropdown
			filterable={true}
			filterPlaceholder={'Choose your weapon'}
			multiselect={true}
			on:change={(event) => {
				console.log('onChange', event)
			}}
			items={[
				{
					value: 'xbox',
					title: 'Xbox Series X'
				},
				{
					value: 'play',
					title: 'Play Station 5'
				},
				{
					value: 'nintendo',
					title: 'Nintendo Switch'
				}
			]}
		>
			<Icon slot="leading" color="currentColor" src={FaBrandsXbox} />
			<svelte:fragment slot="title">Multiselect, Filterable</svelte:fragment>
		</Dropdown>
	</div>
	<div class="flex items-start justify-start w-[80%] gap-x-12">
		<div class="flex flex-col">
			<h3 class="text-neutral-2 mx-2 my-4">Radio button</h3>
			<div
				class="flex flex-row gap-8 items-center justify-center border-2 border-brand-pink rounded-md border-dashed w-[300px] h-fit py-6"
			>
				<input type="radio" />
				<input type="radio" checked />
				<input type="radio" checked disabled />
				<input type="radio" disabled />
			</div>
			<h3 class="text-neutral-2 mx-2 my-4">Checkbox button</h3>
			<div
				class="flex flex-row gap-8 justify-center items-center py-6 w-[150px] border-2 rounded-lg border-brand-pink border-dashed"
			>
				<input type="checkbox" />
				<input type="checkbox" checked />
			</div>
		</div>
		<div>
			<h3 class="text-neutral-2 mx-2 my-4">ToggleButtton</h3>
			<div
				class="flex flex-row gap-8 justify-center items-center py-6 px-6 min-w-fit border-2 rounded-lg border-brand-pink border-dashed"
			>
				<ToggleButtton checked={false} id="id1" text={false} />
				<ToggleButtton checked={false} id="id2" text={false} disabled />
			</div>
			<h3 class="text-neutral-2 mx-2 my-4">ToggleButtton with texts</h3>
			<div
				class="flex flex-row gap-8 justify-center items-center py-6 px-6 min-w-fit border-2 rounded-lg border-brand-pink border-dashed"
			>
				<ToggleButtton checked={false} id="tid1" text right="derecha" left="izquierda" />
				<ToggleButtton checked={true} id="tid2" text />
			</div>
		</div>
	</div>
	<div class="flex items-center w-[80vw]">
		<DragAndDrop
			url="/api/resources"
			name="file"
			title="Upload your image"
			subtitle="PNG, JPG, WEBP, 2MB files are allowed"
			body="600x500"
		/>
	</div>
</div>
