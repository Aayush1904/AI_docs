import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const SyncUser = async () => {
    try {
        // Simplified sync user - just redirect to home
        // TODO: Implement proper user sync when authentication is ready
        console.log('SyncUser: Redirecting to home');
        return redirect('/');
    } catch (error) {
        console.error('Error in SyncUser:', error);
        return redirect('/');
    }
}

export default SyncUser
