import { vi } from 'vitest';

export function createDbProxy() {
	const { dbProxy, setReal } = vi.hoisted(() => {
		let real: Record<string | symbol, unknown> | null = null;
		const proxy = new Proxy(
			{},
			{
				get(_t, prop) {
					const value = real?.[prop];
					return typeof value === 'function' ? value.bind(real) : value;
				}
			}
		);
		return {
			dbProxy: proxy,
			setReal: (d: unknown) => (real = d as Record<string | symbol, unknown>)
		};
	});

	return { dbProxy, setReal };
}
