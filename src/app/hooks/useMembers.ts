import { useState, useEffect } from 'react'
import { membersApi } from '@/app/api/members.api'
import { Membre, CreationMembreData, MiseAJourMembreData, membersWithSubscriptions } from '@/types/membre'

export const useMembers = () => {
    console.log('useMembers hook instance created');
    const [members, setMembers] = useState<Membre[]>([])
    const [membersWithSubscriptions, setMembersWithSubscriptions] = useState<membersWithSubscriptions[]>([])
    const [unpaidMembers, setUnpaidMembers] = useState<Membre[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMembers = async () => {
        console.log('Fetching members...');
        setLoading(true)
        setError(null)
        try {
            const response = await membersApi.getAll()
            console.log('Full API response:', response);
            console.log('Members API response data:', response.data);
            setMembers(response.data)
            console.log('Setting members to:', response);
            return response.data
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Erreur lors du chargement des membres')
            console.error(err)
            return []
        } finally {
            setLoading(false)
        }
    }

    const fetchMembersWithSubscriptions = async () => {
        console.log('Fetching members with subscriptions...');
        try {
            const response = await membersApi.getWithSubscriptions()
            console.log('Members with subscriptions API response:', response);
            setMembersWithSubscriptions(response.data || [])
            return response.data || []
        } catch (err) {
            console.error('Erreur lors du chargement des membres avec subscriptions:', err)
            return []
        }
    }

    const fetchUnpaidMembers = async () => {
        console.log('Fetching unpaid members...');
        try {
            // Use the current members state to filter unpaid members
            const unpaid = membersApi.getUnpaid(members);
            console.log('Unpaid members filtered:', unpaid);
            setUnpaidMembers(unpaid);
            return unpaid
        } catch (err) {
            console.error('Erreur lors du chargement des membres impayés:', err)
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
            console.error(err)
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
            console.error(err)
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
            console.error(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('useMembers hook mounted, fetching data...');
        (async () => {
            const membersResult = await fetchMembers();
            console.log('fetchMembers return:', membersResult);
            const withSubsResult = await fetchMembersWithSubscriptions();
            console.log('fetchMembersWithSubscriptions return:', withSubsResult);
            console.log('members state in hook:', members);
        })();
    }, []);

    useEffect(() => {
        console.log('members state in hook:', members);
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
            console.log('Refetching all data...');
            fetchMembers()
            fetchMembersWithSubscriptions()
            fetchUnpaidMembers()
        }
    }
} 