import { redirect } from '@sveltejs/kit';

export const load = async (event) => {

    const redirectTo = event.url.searchParams.get('redirect') ?? '/organizer-requests'
    throw redirect(302, redirectTo);

}