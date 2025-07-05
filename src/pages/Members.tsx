import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye, X } from 'lucide-react';
import { Membre, FormulaireMembre, } from '@/types/membre';
import { useMembers } from '@/app/hooks/useMembers';
import { useModal } from '@/app/hooks/useModal';
import { Button } from '@/app/common/Button';
import { MemberForm } from '@/components/forms/MemberForm';
import { MembreCard } from '@/components/forms/MemberCard';
import { formatDate, formattelephoneNumber } from '@/utils/formatters';
import { membersApi } from '@/app/api/members.api';

type FilterType = 'all' | 'active-subscriptions' | 'unpaid' | 'revenue';

interface StatsData {
    totalMembers: number;
    activeSubscriptions: number;
    unpaidMembers: number;
    monthlyRevenue: number;
    loading: boolean;
    error: string | null;
}

export const Membres: React.FC = () => {
    const {
        members,
        membersWithSubscriptions,
        unpaidMembers,
        loading,
        error,
        createMember,
        updateMember,
        deleteMember
    } = useMembers();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedMember, setSelectedMember] = useState<Membre | null>(null);
    const [viewedMember, setViewedMember] = useState<Membre | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const memberModal = useModal();
    const viewModal = useModal();

    const totalMembers = members.length;
    const activeSubscriptions = membersWithSubscriptions.reduce((total, m) =>
        total + ((m.subscriptions || []).filter((sub: any) => sub.estActif).length || 0), 0
    );
    const unpaidCount = unpaidMembers.length;
    const monthlyRevenue = membersWithSubscriptions.reduce((total, m) => {
        const activeSubs = (m.subscriptions || []).filter((sub: any) => sub.estActif) || [];
        return total + activeSubs.reduce((subTotal: any, sub: any) => subTotal + sub.prixMensuel, 0);
    }, 0);

    // Filtering logic
    let displayedMembers: Membre[] = members;

    switch (activeFilter) {
        case 'active-subscriptions':
            displayedMembers = membersWithSubscriptions.filter(m =>
                (m.subscriptions || []).some((sub: any) => sub.estActif)
            );
            break;
        case 'revenue':
            displayedMembers = membersWithSubscriptions.filter(m =>
                (m.subscriptions || []).some((sub: any) => sub.estActif)
            );
            break;
        case 'unpaid':
            displayedMembers = unpaidMembers;
            break;
        default:
            // 'all' filter - no change
            break;
    }

    // Apply search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        displayedMembers = displayedMembers.filter(member =>
            member.nom.toLowerCase().includes(query) ||
            member.prenom.toLowerCase().includes(query) ||
            member.telephone.includes(searchQuery)
        );
    }
    const handleFilterClick = (filterType: FilterType) => {
        setActiveFilter(filterType);
        setSearchQuery('');
    };

    const clearFilters = () => {
        setActiveFilter('all');
        setSearchQuery('');
    };

    const handleEdit = (member: Membre) => {
        setSelectedMember(member);
        memberModal.openModal();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
            try {
                await deleteMember(id);
            } catch (error) {
                console.error('Error deleting member:', error);
            }
        }
    };

    const handleView = (member: Membre) => {
        setViewedMember(member);
        viewModal.openModal();
    };

    const handleSave = async (data: FormulaireMembre) => {
        if (selectedMember) {
            await updateMember(selectedMember.id, { ...data, id: selectedMember.id });
        } else {
            await createMember(data);
        }
        setSelectedMember(null);
    };

    console.log('members:', members);
    console.log('displayedMembers:', displayedMembers);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Membres</h1>
                    <p className="text-gray-600">Gérez vos membres de la salle de sport</p>
                </div>
                <Button onClick={() => memberModal.openModal()}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nouveau membre
                </Button>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-96">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un membre..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        {displayedMembers.length} résultat{displayedMembers.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => setViewMode('grid')}
                        >
                            Grille
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => setViewMode('list')}
                        >
                            Liste
                        </Button>
                    </div>
                </div>
            </div>

            {/* Active Filter Indicator */}
            {(activeFilter !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-sm text-blue-800">
                        Filtre actif:
                        {activeFilter !== 'all' && (
                            <span className="font-medium ml-1">
                                {activeFilter === 'active-subscriptions' && 'Abonnements actifs'}
                                {activeFilter === 'unpaid' && 'Membres impayés'}
                                {activeFilter === 'revenue' && 'Revenu mensuel'}
                            </span>
                        )}
                        {searchQuery && (
                            <span className="font-medium ml-1">
                                Recherche: "{searchQuery}"
                            </span>
                        )}
                    </span>
                    <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Effacer les filtres"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Members Display */}
            {displayedMembers.length === 0 ? (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {searchQuery ? 'Aucun membre trouvé pour cette recherche' : 'Aucun membre enregistré'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedMembers.map(member => (
                        <div key={member.id} className="relative">
                            <MembreCard Membre={member} showSubscription />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => handleView(member)}
                                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                                    title="Voir détails"
                                >
                                    <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                                    title="Modifier"
                                >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Membre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'inscription
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedMembers.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {member.prenom} {member.nom}
                                            </div>
                                            <div className="text-sm text-gray-500">{member.adresse}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formattelephoneNumber(member.telephone)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(member.dateInscription)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleView(member)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Voir"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Member Form Modal */}
            <MemberForm
                member={selectedMember}
                isOpen={memberModal.isOpen}
                onClose={memberModal.closeModal}
                onSave={handleSave}
            />

            {/* Member Details Modal */}
            {viewModal.isOpen && viewedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Détails du membre</h2>
                            <button
                                onClick={viewModal.closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <p className="text-gray-900 font-medium">{viewedMember.prenom} {viewedMember.nom}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <p className="text-gray-900">{formattelephoneNumber(viewedMember.telephone)}</p>
                            </div>
                            {viewedMember.adresse && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                    <p className="text-gray-900">{viewedMember.adresse}</p>
                                </div>
                            )}
                            {viewedMember.datedenaissence && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                                    <p className="text-gray-900">{formatDate(viewedMember.datedenaissence)}</p>
                                </div>
                            )}
                            {viewedMember.telParent && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du parent</label>
                                    <p className="text-gray-900">{viewedMember.telParent}</p>
                                </div>
                            )}
                            {viewedMember.dateDebut && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                    <p className="text-gray-900">{formatDate(viewedMember.dateDebut)}</p>
                                </div>
                            )}
                            {viewedMember.dateInscription && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                                    <p className="text-gray-900">{formatDate(viewedMember.dateInscription)}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button
                                onClick={() => {
                                    viewModal.closeModal();
                                    handleEdit(viewedMember);
                                }}
                                className="flex-1"
                            >
                                Modifier
                            </Button>
                            <Button variant="secondary" onClick={viewModal.closeModal} className="flex-1">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membres; 