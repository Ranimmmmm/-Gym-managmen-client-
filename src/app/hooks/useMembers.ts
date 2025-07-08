import { useState, useEffect } from 'react'
import { membersApi } from '@/app/api/members.api'
import { Membre, CreationMembreData, MiseAJourMembreData, membersWithSubscriptions } from '@/types/membre'

export const useMembers = () => {
    const [members, setMembers] = useState<Membre[]>([])
    const [membersWithSubscriptions, setMembersWithSubscriptions] = useState<membersWithSubscriptions[]>([])
    const [unpaidMembers, setUnpaidMembers] = useState<Membre[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMembers = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await membersApi.getAll()
            setMembers(response.data)
            return response.data
        } catch (err) {
            setError('Erreur lors du chargement des membres')
            return []
        } finally {
            setLoading(false)
        }
    }

    const fetchMembersWithSubscriptions = async () => {
        try {
            const response = await membersApi.getWithSubscriptions()
            setMembersWithSubscriptions(response.data || [])
            return response.data || []
        } catch (err) {
            return []
        }
    }

    const fetchUnpaidMembers = async () => {
        try {
            // Use the current members state to filter unpaid members
            const unpaid = membersApi.getUnpaid(members);
            setUnpaidMembers(unpaid);
            return unpaid
        } catch (err) {
            return []
        }
    }

    const createMember = async (memberData: CreationMembreData) => {
        setLoading(true)
        setError(null)
        try {
            const response = await membersApi.create(memberData)
            const newMember = response.data
            setMembers(prev => [...prev, newMember])
            return newMember
        } catch (err) {
            setError('Erreur lors de la création du membre')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateMember = async (id: number, memberData: MiseAJourMembreData) => {
        setLoading(true)
        setError(null)
        try {
            const response = await membersApi.update(id, memberData)
            const updatedMember = response.data
            setMembers(prev => prev.map(member =>
                member.id === id ? updatedMember : member
            ))
            return updatedMember
        } catch (err) {
            setError('Erreur lors de la mise à jour du membre')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteMember = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            await membersApi.delete(id)
            setMembers(prev => prev.filter(member => member.id !== id))
        } catch (err) {
            setError('Erreur lors de la suppression du membre')
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        (async () => {
            const membersResult = await fetchMembers();
            const withSubsResult = await fetchMembersWithSubscriptions();
        })();
    }, []);

    useEffect(() => {
    }, [members]);

    useEffect(() => {
        if (members.length > 0) {
            fetchUnpaidMembers();
        }
    }, [members]);

    return {
        members,
        membersWithSubscriptions,
        unpaidMembers,
        loading,
        error,
        createMember,
        updateMember,
        deleteMember,
        refetch: fetchMembers,
        refetchAll: () => {
            fetchMembers()
            fetchMembersWithSubscriptions()
            fetchUnpaidMembers()
        }
    }
} 