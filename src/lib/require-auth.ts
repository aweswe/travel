import pb from '@/lib/pocketbase-client';

/**
 * Guard a client-protected action or view.
 */
export function requireAuth(redirectTo = '/login') {
	const { record } = pb.authStore;

	if (!pb.authStore.isValid || !record) {
		if (typeof window !== 'undefined') {
			window.location.href = redirectTo;
		}
		return null;
	}

	return record;
}

export default requireAuth;
