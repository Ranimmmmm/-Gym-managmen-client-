// hooks/useMemberSubscriptions.ts
import { useState, useEffect } from 'react';
import { MembreAvecAbonnements, Subscription } from '@/types/membre';
import { subscriptionsApi } from '@/app/api/subscriptions';

export const useMemberSubscriptions = () => {
    const [members, setMembers] = useState<MembreAvecAbonnements[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await subscriptionsApi.getMembersWithSubscriptions();
            // Map 'subscriptions' to 'abonnements' for frontend compatibility
            const mapped = data.map(member => ({
                ...member,
                abonnements: (member as any).subscriptions || []
            }));
            setMembers(mapped);
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
        (member.abonnements || []).map(sub => ({ ...sub, memberName: `${member.prenom} ${member.nom}` }))
    );

    return {
        members,
        subscriptions,
        loading,
        error,
        refetch: fetchData,
    };
};