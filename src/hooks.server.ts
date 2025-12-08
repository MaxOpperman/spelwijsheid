import type { Handle } from '@sveltejs/kit';

/**
 * Format current timestamp in local time
 */
function formatTimestamp(): string {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();
	const year = now.getFullYear();
	const hours = now.getHours();
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;

	return `${month}/${day}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * HTTP request/response logger
 */
export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();
	let clientIp: string | undefined;

	// Try to get client IP and log the request, but skip if during prerendering
	try {
		clientIp = event.getClientAddress();
		const method = event.request.method;
		const path = event.url.pathname;

		// Log the incoming request
		console.log(`HTTP  ${formatTimestamp()} ${clientIp} ${method} ${path}`);
	} catch {
		// Skip logging during prerendering
	}

	// Process the request
	const response = await resolve(event);

	// Log the response if we have a client IP
	if (clientIp) {
		const duration = Date.now() - startTime;
		console.log(
			`HTTP  ${formatTimestamp()} ${clientIp} Returned ${response.status} in ${duration} ms`
		);
	}

	return response;
};
