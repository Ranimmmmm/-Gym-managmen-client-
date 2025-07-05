import React from 'react';
import { CreditCard, Calendar, User, DollarSign } from 'lucide-react';
import { Subscription } from '@/types/membre';
import { formatDate } from '@/utils/formatters';

interface SubscriptionCardProps {
    subscription: any; // Updated to use any since we're adding memberName
    memberName?: string;
    onEdit?: (subscription: any) => void;
    onDelete?: (id: number) => void;
    onView?: (subscription: any) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    subscription,
    memberName,
    onEdit,
    onDelete,
    onView,
}) => {
    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getStatusText = (isActive: boolean) => {
        return isActive ? 'Actif' : 'Inactif';
    };

    const isExpired = new Date(subscription.dateFin) < new Date();
    const isExpiringSoon = new Date(subscription.dateFin) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Use memberName from subscription if available, otherwise fall back to prop
    const displayMemberName = subscription.memberName || memberName || `Membre #${subscription.membreId}`;

    return (
        <div className="subscription-card hover-lift">
            {/* Header */}
            <div className="subscription-card__header">
                <div className="subscription-card__avatar">
                    <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="subscription-card__info">
                    <h3 className="subscription-card__title">
                        {subscription.typeSport}
                    </h3>
                    <p className="subscription-card__member">
                        {displayMemberName}
                    </p>
                </div>
                {onEdit && onDelete && (
                    <div className="subscription-card__actions">
                        <button
                            onClick={() => onEdit(subscription)}
                            className="btn btn--icon btn--secondary transition-all duration-200 hover-lift"
                            title="Modifier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(subscription.id)}
                            className="btn btn--icon btn--danger transition-all duration-200 hover-lift"
                            title="Supprimer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="subscription-card__content">
                <div className="subscription-card__details">
                    <div className="detail-item">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="detail-item__text">{subscription.prixMensuel} DT/mois</span>
                    </div>

                    <div className="detail-item">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="detail-item__text">
                            {formatDate(subscription.dateDébut)} - {formatDate(subscription.dateFin)}
                        </span>
                    </div>

                    <div className="detail-item">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="detail-item__text">Membre #{subscription.membreId}</span>
                    </div>
                </div>

                <div className="subscription-card__status">
                    <div className="status-badges">
                        <span className={`badge ${getStatusColor(subscription.estActif)}`}>
                            {getStatusText(subscription.estActif)}
                        </span>

                        {isExpired && (
                            <span className="badge badge--status-expire">
                                Expiré
                            </span>
                        )}

                        {isExpiringSoon && !isExpired && (
                            <span className="badge badge--status-suspendu">
                                Expire bientôt
                            </span>
                        )}
                    </div>

                    {onView && (
                        <button
                            onClick={() => onView(subscription)}
                            className="btn btn--link btn--small transition-all duration-200 hover:text-blue-700"
                        >
                            Voir détails
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}; 