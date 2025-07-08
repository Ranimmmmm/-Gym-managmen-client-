// hooks/useMemberSubscriptions.ts
import { useState, useEffect } from 'react';
import { membersWithSubscriptions, Subscription } from '@/types/membre';
import { subscriptionsApi } from '@/app/api/subscriptions';

export const useMemberSubscriptions = () => {
    const [members, setMembers] = useState<membersWithSubscriptions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await subscriptionsApi.getMembersWithSubscriptions();
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Flatten all subscriptions for convenience
    const subscriptions: (Subscription & { memberName: string })[] = members.flatMap(member =>
        (member.subscriptions || []).map((sub: Subscription) => ({ ...sub, memberName: `${member.prenom} ${member.nom}` }))
    );

    const deleteSubscription = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await subscriptionsApi.deleteSubscription(id);
            // Refresh the data after deletion
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'abonnement');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        members,
        subscriptions,
        loading,
        error,
        deleteSubscription,
        refetch: fetchData,
    };
};