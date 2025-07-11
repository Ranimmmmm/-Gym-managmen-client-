'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSubscriptions } from '@/app/hooks/useSubscriptions'
import { useMembers } from '@/app/hooks/useMembers'
import { useModal } from '@/app/hooks/useModal';
import { useConfirmation } from '@/app/hooks/useConfirmation';
import { Search, CreditCard, Edit, Trash2, Eye, Plus, BarChart } from 'lucide-react';
import { Subscription } from '@/types/membre';
import { Button } from '@/app/common/Button';
import { ConfirmationModal } from '@/app/common/ConfirmationModal';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { SubscriptionCard } from '@/components/forms/SubscriptionCard';
import { formatDate } from '@/utils/formatters';
import { subscriptionsApi } from '@/app/api/subscriptions';
import { SecurityProvider, useSecurity } from '@/app/common/SecurityProvider';
import { Header } from '@/components/layout/Header';


interface SubscriptionFormData {
    membreId: number;
    typeSport: string;
    prixMensuel: number;
    dateDébut: string;
    dateFin: string;
}

// Security modal component
const SecurityModal: React.FC = () => {
    const { isUnlocked, unlock, codeSet } = useSecurity();
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    if (isUnlocked) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Saisissez le code de sécurité</h2>
                <input
                    type="password"
                    className="form-input mb-2"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Code de sécurité"
                />
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <button
                    className="btn btn--primary w-full"
                    onClick={() => {
                        if (!unlock(input)) setError('Code incorrect');
                    }}
                >
                    Valider
                </button>
                {!codeSet && <div className="text-xs text-gray-500 mt-2">Aucun code défini. Veuillez demander à l'admin de définir un code.</div>}
            </div>
        </div>
    );
};

// Settings modal for admin to set code
const SecuritySettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const { changeCode, codeSet } = useSecurity();
    const [newCode, setNewCode] = useState('');
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        // If no code is set and there is an env code, set it
        if (!codeSet && process.env.NEXT_PUBLIC_SECURITY_CODE) {
            changeCode(process.env.NEXT_PUBLIC_SECURITY_CODE);
        }
    }, [codeSet, changeCode]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Définir le code de sécurité</h2>
                <input
                    type="password"
                    className="form-input mb-2"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="Nouveau code"
                />
                <button
                    className="btn btn--primary w-full"
                    onClick={() => {
                        changeCode(newCode);
                        setSuccess(true);
                        setTimeout(onClose, 1000);
                    }}
                >
                    Définir le code
                </button>
                {success && <div className="text-green-600 mt-2">Code défini !</div>}
            </div>
        </div>
    );
};

export const SubscriptionsContent: React.FC = () => {
    const { subscriptions, membersWithSubscriptions, loading, error, refetch } = useSubscriptions();
    const { members } = useMembers();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
    const [showRevenueHistory, setShowRevenueHistory] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { isUnlocked } = useSecurity();

    const subscriptionModal = useModal();
    const viewModal = useModal();
    const confirmationModal = useConfirmation();

    // Create a map of member names for quick lookup
    const memberMap = new Map(members.map(member => [member.id, `${member.prenom} ${member.nom}`]));

    // Filter subscriptions based on search query
    const filteredSubscriptions = subscriptions.filter(subscription => {
        const memberName = subscription.memberName || memberMap.get(subscription.membreId) || '';
        return (
            memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subscription.typeSport.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subscription.prixMensuel.toString().includes(searchQuery)
        );
    });

    const handleEdit = (subscription: any) => {
        setSelectedSubscription(subscription);
        subscriptionModal.openModal();
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirmationModal.confirm({
            title: 'Supprimer l\'abonnement',
            message: 'Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await subscriptionsApi.deleteSubscription(id);
                refetch();
            } catch (error) {
                console.error('Error deleting subscription:', error);
            }
        }
    };

    const handleView = (subscription: any) => {
        setSelectedSubscription(subscription);
        viewModal.openModal();
    };

    const handleSave = async (data: SubscriptionFormData) => {
        try {
            await subscriptionsApi.createSubscription(data);
            refetch();
        } catch (error) {
            console.error('Error saving subscription:', error);
        }
        setSelectedSubscription(null);
    };

    // Calculate statistics
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    // Only include subscriptions active in the current month
    const currentMonthSubscriptions = subscriptions.filter(s => {
        const start = new Date(s.dateDébut);
        const end = new Date(s.dateFin);
        return (
            start.getFullYear() <= currentYear && end.getFullYear() >= currentYear &&
            start.getMonth() <= currentMonth && end.getMonth() >= currentMonth &&
            start <= now && end >= now
        );
    });
    const isExpired = (sub: any) => new Date(sub.dateFin) < now;
    const isActive = (sub: any) => !isExpired(sub) && sub.estActif;
    const isExpiringSoon = (sub: any) =>
        isActive(sub) &&
        new Date(sub.dateFin) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const stats = {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(isActive).length,
        expiredSubscriptions: subscriptions.filter(isExpired).length,
        expiringSoon: subscriptions.filter(isExpiringSoon).length,
        totalRevenue: currentMonthSubscriptions.reduce((sum, s) => sum + Number(s.prixMensuel), 0),
    };

    // Revenue history by month
    type SubscriptionType = typeof subscriptions[number];
    interface RevenueHistoryItem {
        month: string;
        revenue: number;
    }
    function getRevenueHistory(subs: SubscriptionType[]): RevenueHistoryItem[] {
        const history: Record<string, number> = {};
        subs.forEach((s) => {
            const start = new Date(s.dateDébut);
            const end = new Date(s.dateFin);
            let year = start.getFullYear();
            let month = start.getMonth();
            const endYear = end.getFullYear();
            const endMonth = end.getMonth();
            while (year < endYear || (year === endYear && month <= endMonth)) {
                const key = `${year}-${String(month + 1).padStart(2, '0')}`;
                if (!history[key]) history[key] = 0;
                history[key] += Number(s.prixMensuel);
                // Move to next month
                if (month === 11) {
                    month = 0;
                    year++;
                } else {
                    month++;
                }
            }
        });
        // Sort by year and month descending
        return Object.entries(history)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, value]) => ({ month: key, revenue: value }));
    }
    const revenueHistory: RevenueHistoryItem[] = useMemo(() => getRevenueHistory(subscriptions), [subscriptions]);

    useEffect(() => {
        if (error) {
            console.error('Subscriptions error:', error);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Erreur: {error}</p>
            </div>
        );
    }

    return (
        <>
            <SecuritySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <div className={isUnlocked ? '' : 'filter blur-sm pointer-events-none select-none relative'}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-lg p-6 shadow-sm border">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
                            <p className="text-gray-600">Gérez les abonnements de vos membres</p>
                        </div>
                        <Button onClick={() => subscriptionModal.openModal()} className="transition-all duration-200 hover-lift">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvel abonnement
                        </Button>
                    </div>

                    {/* Search and View Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
                        <div className="w-full sm:w-96">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un abonnement..."
                                className="form-input"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                                size="small"
                                onClick={() => setViewMode('grid')}
                                className="transition-all duration-200"
                            >
                                Grille
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                                size="small"
                                onClick={() => setViewMode('list')}
                                className="transition-all duration-200"
                            >
                                Liste
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-2xl font-bold text-blue-600">{stats.totalSubscriptions}</p>
                                <p className="text-sm text-gray-600">Total abonnements</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                                <p className="text-sm text-gray-600">Abonnements actifs</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</p>
                                <p className="text-sm text-gray-600">Abonnements expirés</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue} DT</p>
                                    <button
                                        className="ml-2 text-purple-600 hover:text-purple-800"
                                        title="Afficher l'historique des revenus"
                                        onClick={() => setShowRevenueHistory(v => !v)}
                                    >
                                        <BarChart className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600">Revenus du mois en cours</p>
                            </div>
                        </div>
                        {/* Revenue History Table */}
                        {showRevenueHistory && (
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-2">Historique des revenus mensuels</h2>
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border-b text-left">Mois</th>
                                            <th className="px-4 py-2 border-b text-left">Revenu (DT)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueHistory.map(({ month, revenue }) => (
                                            <tr key={month}>
                                                <td className="px-4 py-2 border-b">{month}</td>
                                                <td className="px-4 py-2 border-b">{revenue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Subscriptions Display */}
                    {filteredSubscriptions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">
                                {searchQuery ? 'Aucun abonnement trouvé pour cette recherche' : 'Aucun abonnement enregistré'}
                            </p>
                            {!searchQuery && (
                                <p className="text-gray-500 text-sm mt-2">
                                    Commencez par ajouter votre premier abonnement
                                </p>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSubscriptions.map((subscription, index) => (
                                <div key={subscription.id} className="relative fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <SubscriptionCard
                                        subscription={subscription}
                                        memberName={subscription.memberName}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onView={handleView}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Abonnement
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Membre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSubscriptions.map((subscription, index) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50 transition-colors fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subscription.typeSport}
                                                    </div>
                                                    <div className="text-sm text-gray-500">#{subscription.id}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {subscription.memberName || `Membre #${subscription.membreId}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {subscription.prixMensuel} DT
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2 items-center">
                                                    {isExpired(subscription) ? (
                                                        <span className="badge badge--status-expire bg-red-100 text-red-800">Expiré</span>
                                                    ) : isActive(subscription) ? (
                                                        <span className="badge badge--status-actif bg-green-100 text-green-800">Actif</span>
                                                    ) : (
                                                        <span className="badge badge--status-inactif bg-red-100 text-red-800">Inactif</span>
                                                    )}
                                                    {!isExpired(subscription) && isExpiringSoon(subscription) && (
                                                        <span className="badge badge--status-suspendu bg-yellow-100 text-yellow-800">Expire bientôt</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(subscription.dateDébut)} - {formatDate(subscription.dateFin)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleView(subscription)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Voir"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(subscription)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subscription.id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
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

                    {/* Subscription Form Modal */}
                    <SubscriptionForm
                        subscription={selectedSubscription}
                        isOpen={subscriptionModal.isOpen}
                        onClose={subscriptionModal.closeModal}
                        onSave={handleSave}
                        members={members}
                    />

                    {/* Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={confirmationModal.isOpen}
                        onClose={confirmationModal.close}
                        onConfirm={confirmationModal.handleConfirm}
                        title={confirmationModal.title}
                        message={confirmationModal.message}
                        confirmText={confirmationModal.confirmText}
                        cancelText={confirmationModal.cancelText}
                        type={confirmationModal.type}
                    />

                    {/* Subscription Details Modal */}
                    {viewModal.isOpen && selectedSubscription && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-medium">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Détails de l'abonnement</h2>
                                    <button
                                        onClick={viewModal.closeModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de sport</label>
                                        <p className="text-gray-900 font-medium">{selectedSubscription.typeSport}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
                                        <p className="text-gray-900">{selectedSubscription.memberName || `Membre #${selectedSubscription.membreId}`}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix mensuel</label>
                                        <p className="text-gray-900">{selectedSubscription.prixMensuel} DT</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                        <p className="text-gray-900">{formatDate(selectedSubscription.dateDébut)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                        <p className="text-gray-900">{formatDate(selectedSubscription.dateFin)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                        <div className="flex gap-2 items-center">
                                            {isExpired(selectedSubscription) ? (
                                                <span className="badge badge--status-expire bg-red-100 text-red-800">Expiré</span>
                                            ) : isActive(selectedSubscription) ? (
                                                <span className="badge badge--status-actif bg-green-100 text-green-800">Actif</span>
                                            ) : (
                                                <span className="badge badge--status-inactif bg-red-100 text-red-800">Inactif</span>
                                            )}
                                            {!isExpired(selectedSubscription) && isExpiringSoon(selectedSubscription) && (
                                                <span className="badge badge--status-suspendu bg-yellow-100 text-yellow-800">Expire bientôt</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <Button
                                        onClick={() => {
                                            viewModal.closeModal();
                                            handleEdit(selectedSubscription);
                                        }}
                                        className="flex-1 transition-all duration-200"
                                    >
                                        Modifier
                                    </Button>
                                    <Button variant="secondary" onClick={viewModal.closeModal} className="flex-1 transition-all duration-200">
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <SecurityModal />
        </>
    );
};

export default function SubscriptionsPage() {
    return (
        <SecurityProvider>
            <SubscriptionsContent />
        </SecurityProvider>
    );
} 