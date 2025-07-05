// src/hooks/useSubscriptions.ts

import { useState, useEffect } from 'react';
import { membersWithSubscriptions } from '../../types/membre';
import { api } from '../../utils/api';

export const useSubscriptions = () => {
  const [membersWithSubscriptions, setMembersWithSubscriptions] = useState<membersWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembersWithSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMembersWithSubscription();
      setMembersWithSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Extract all subscriptions from members
  const subscriptions = membersWithSubscriptions.flatMap(member =>
    (member.subscriptions || []).map(sub => ({ ...sub, memberName: `${member.prenom} ${member.nom}` }))
  );

  useEffect(() => {
    fetchMembersWithSubscriptions();
  }, []);

  return {
    subscriptions,
    membersWithSubscriptions,
    loading,
    error,
    refetch: fetchMembersWithSubscriptions,
  };
};
