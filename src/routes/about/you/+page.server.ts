import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		error(401, 'Unauthorized');
	}

	return {
		user
	};
};
