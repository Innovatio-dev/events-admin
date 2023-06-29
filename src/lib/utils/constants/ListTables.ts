import DateViewer from '$lib/components/table_cell/DateViewer.svelte'
import MailViewer from '$lib/components/table_cell/MailViewer.svelte'
import CountryViewer from '$lib/components/table_cell/CountryViewer.svelte'
import TypeEventViewer from '$lib/components/table_cell/TypeEventViewer.svelte'
import StatusViewer from '$lib/components/table_cell/StatusViewer.svelte'
import SeeMoreButton from '$lib/components/table_cell/SeeMoreButton.svelte'

export const OrganizerRequestColumns = [
	{
		title: 'ID',
		sortable: true,
		dataKey: 'uid',
		minWidth: '8em',
		grow: '0'
	},
	{
		title: 'Date Request',
		sortable: true,
		dataKey: 'createdAt',
		grow: '0',
		minWidth: '11em',
		cellComponent: DateViewer
	},
	{
		title: 'Organizer Name',
		sortable: true,
		dataKey: 'name'
	},
	{
		title: 'Email Address',
		sortable: true,
		dataKey: 'email',
		cellComponent: MailViewer,
		minWidth: '180px'
	},
	{
		title: 'Country',
		sortable: true,
		dataKey: 'country',
		cellComponent: CountryViewer
	},
	{
		title: 'Type Event',
		sortable: true,
		dataKey: 'typeEvent',
		cellComponent: TypeEventViewer,
		minWidth: '12em',
		grow: '0'
	},
	{
		title: 'Mavie ID',
		sortable: false,
		dataKey: 'mavieId'
	},
	{
		title: 'Status',
		sortable: true,
		dataKey: 'status',
		grow: '0',
		minWidth: '5em',
		cellComponent: StatusViewer
	},
	{
		title: 'Details',
		sortable: false,
		cellComponent: SeeMoreButton,
		minWidth: '8em',
		grow: '0',
		dataKey: 'link'
	}
]
