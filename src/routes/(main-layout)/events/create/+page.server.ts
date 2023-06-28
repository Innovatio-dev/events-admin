export async function load(event) {
	const response = await event.fetch('/api/organizers')
	if (response.ok) {
		const organizers = await response.json()
		return {
			organizers
		}
	}
}
