import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useMembers } from '@/app/hooks/useMembers';
import { useSubscriptions } from '@/app/hooks/useSubscriptions';
import { Button } from '@/app/common/Button';
import { MembreCard } from '@/components/forms/MemberCard';
import { formatDate, formattelephoneNumber } from '@/utils/formatters';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { subscriptionsApi } from '@/app/api/subscriptions';
import { Header } from '@/components/layout/Header';


const ImpayeesContent: React.FC = () => {
    // const { isUnlocked } = useSecurity();
    const { membersWithSubscriptions, refetch: refetchMembers } = useMembers();
    const { refetch: refetchSubscriptions } = useSubscriptions();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Only members with NO active subscriptions (all expired)
    const today = new Date();
    const unpaidMembers = (membersWithSubscriptions || []).filter(member =>
        !(member.subscriptions || []).some(sub => sub.estActif && new Date(sub.dateFin) >= today)
    );

    // Filter unpaid members by search
    let displayedMembers = unpaidMembers.filter(m => m && m.id);
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        displayedMembers = displayedMembers.filter(member =>
            member.nom.toLowerCase().includes(query) ||
            member.prenom.toLowerCase().includes(query) ||
            member.telephone.includes(searchQuery)
        );
    }

    const handleRenew = (member: any) => {
        setSelectedMember(member);
        setShowRenewModal(true);
    };

    const handleRenewSave = async (data: any) => {
        // Find the last expired subscription for the member
        const lastSub = (selectedMember.subscriptions || [])
            .sort((a: any, b: any) => new Date(b.dateFin).getTime() - new Date(a.dateFin).getTime())[0];
        if (lastSub && lastSub.id) {
            await subscriptionsApi.renewSubscription(lastSub.id, data);
        } else {
            await subscriptionsApi.createSubscription(data);
        }
        setShowRenewModal(false);
        setSelectedMember(null);
        if (refetchMembers) refetchMembers();
        if (refetchSubscriptions) refetchSubscriptions();
    };

    return (
        <div>
            {/* <SecuritySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} /> */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Membres impayés</h1>
                        <p className="text-gray-600">Liste des membres sans abonnement actif</p>
                    </div>
                </div>
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
                {displayedMembers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">
                            {searchQuery ? 'Aucun membre trouvé pour cette recherche' : 'Aucun membre impayé'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedMembers.map(member => (
                            <div key={member.id} className="relative">
                                <MembreCard Membre={member} showSubscription={false} />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button size="small" onClick={() => handleRenew(member)}>
                                        <UserPlus className="w-4 h-4 mr-1" /> Renouveler
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{member.prenom} {member.nom}</div>
                                                <div className="text-sm text-gray-500">{member.adresse}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formattelephoneNumber(member.telephone)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(member.dateInscription)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button size="small" onClick={() => handleRenew(member)}>
                                                <UserPlus className="w-4 h-4 mr-1" /> Renouveler
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Renew Subscription Modal */}
                {showRenewModal && selectedMember && (
                    <SubscriptionForm
                        isOpen={showRenewModal}
                        onClose={() => setShowRenewModal(false)}
                        onSave={handleRenewSave}
                        members={[{ id: selectedMember.id, prenom: selectedMember.prenom, nom: selectedMember.nom }]}
                        subscription={null}
                    />
                )}
            </div>
        </div>
    );
};

const Impayees: React.FC = () => <ImpayeesContent />;

export default Impayees; 