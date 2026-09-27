const SCANNER_PATH_PATTERNS = [
	/(?:^|\/)\.git(?:[._-]|\/|$)/i,
	/(?:^|\/)\.env(?:[./~]|$)/i,
	/(?:^|\/)(?:\.aws|\.azure|\.config\/gcloud)(?:[._-]|\/|$)/i,
	/(?:^|\/)(?:terraform\.tfstate(?:\.backup)?|terraform\.tfvars)(?:\/|$)/i,
	/(?:^|\/)(?:credentials?|secrets?|service-account|gcloud-service-key|aws-exports|amplifyconfiguration|cloudformation|litellm(?:_config)?|openai-proxy)(?:[._/-]|$)/i,
	/(?:^|\/)(?:wp-|wp\/|wp-json|wordpress|administrator|phpmyadmin)(?:[._/-]|$)/i,
	/(?:^|\/)(?:phpinfo|phpversion|server-(?:status|info)|_environment)(?:[./~_-]|$)/i,
	/\.php(?:[./~]|$)/i
] as const;

function normalizePath(pathname: string): string {
	let normalized = pathname;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			const decoded = decodeURIComponent(normalized);
			if (decoded === normalized) break;
			normalized = decoded;
		} catch {
			break;
		}
	}
	return normalized.replaceAll('\\', '/').replace(/\/{2,}/g, '/');
}

/** Return true for common automated probes that do not belong to this app. */
export function isScannerPath(pathname: string): boolean {
	return SCANNER_PATH_PATTERNS.some((pattern) => pattern.test(normalizePath(pathname)));
}
