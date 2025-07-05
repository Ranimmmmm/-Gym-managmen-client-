import { useState, useEffect } from 'react';
import { Membre, FormulaireMembre } from '../../types/membre';
import { membersApi } from '../api/members.api';

export const useMembersSearch = () => {
  const [members, setMembers] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await membersApi.getAll();
      setMembers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createMember = async (data: FormulaireMembre) => {
    try {
      const response = await membersApi.create(data);
      setMembers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    }
  };

  const updateMember = async (id: number, data: Partial<FormulaireMembre>) => {
    try {
      const response = await membersApi.update(id, data);
      setMembers(prev => prev.map(member =>
        member.id === id ? response.data : member
      ));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
      throw err;
    }
  };

  const deleteMember = async (id: number) => {
    try {
      await membersApi.delete(id);
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    createMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
};