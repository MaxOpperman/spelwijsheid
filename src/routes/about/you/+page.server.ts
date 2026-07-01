import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const prerender = false;

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	return {
		user
	};
};
