import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Membre, membersWithSubscriptions, Subscription } from '@/types/membre';
import { formatDate, formattelephoneNumber } from '@/utils/formatters';

interface MembreCardProps {
    Membre: Membre | membersWithSubscriptions;
    showSubscription?: boolean;
    onEdit?: (Membre: Membre) => void;
    onDelete?: (id: number) => void;
    onViewSubscription?: (MembreId: number) => void;
}

export const MembreCard: React.FC<MembreCardProps> = ({
    Membre,
    showSubscription = false,
    onEdit,
    onDelete,
    onViewSubscription,
}) => {
    const MembreWithSub = Membre as membersWithSubscriptions;
    const hasSubscription = 'subscriptions' in Membre && Membre.subscriptions && Membre.subscriptions.length > 0;

    const getSubscriptionStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getActiveSubscription = (): Subscription | undefined => {
        if (Membre.subscriptions && Membre.subscriptions.length > 0) {
            return Membre.subscriptions.find(sub => sub.estActif);
        }
        return undefined;
    };

    const activeSubscription = getActiveSubscription();

    return (
        <div className="member-card hover-lift">
            {/* Header */}
            <div className="member-card__header">
                <div className="member-card__avatar">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div className="member-card__info">
                    <h3 className="member-card__name">
                        {Membre.prenom} {Membre.nom}
                    </h3>
                    <p className="member-card__date">
                        Membre depuis {formatDate(Membre.dateInscription)}
                    </p>
                </div>
                {onEdit && onDelete && (
                    <div className="member-card__actions">
                        <button
                            onClick={() => onEdit(Membre)}
                            className="btn btn--icon btn--secondary transition-all duration-200 hover-lift"
                            title="Modifier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(Membre.id)}
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

            {/* Contact Information */}
            <div className="member-card__content">
                <div className="member-card__contact">
                    <div className="contact-item">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="contact-item__text">{formattelephoneNumber(Membre.telephone)}</span>
                    </div>
                    <div className="contact-item">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="contact-item__text">{Membre.adresse}</span>
                    </div>
                    {Membre.typeSport && (
                        <div className="contact-item">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="contact-item__text">{Membre.typeSport}</span>
                        </div>
                    )}
                    {Membre.dateDebut && (
                        <div className="contact-item">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="contact-item__text">Début: {formatDate(Membre.dateDebut)}</span>
                        </div>
                    )}
                    {Membre.datedenaissence && (
                        <div className="contact-item">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="contact-item__text">Date de naissance: {formatDate(Membre.datedenaissence)}</span>
                        </div>
                    )}
                    {Membre.telParent && (
                        <div className="contact-item">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="contact-item__text">Téléphone du parent: {Membre.telParent}</span>
                        </div>
                    )}
                </div>

                {/* Subscription Information */}
                {showSubscription && hasSubscription && activeSubscription && (
                    <div className="member-card__subscription">
                        <div className="subscription-header">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <span className="subscription-title">Abonnement</span>
                        </div>

                        <div className="subscription-details">
                            <div className="subscription-type">
                                <span className="badge badge--primary">
                                    {activeSubscription.typeSport}
                                </span>
                                <span className="subscription-amount">
                                    {activeSubscription.prixMensuel}DT
                                </span>
                            </div>

                            <div className="subscription-status">
                                <span className={`badge ${getSubscriptionStatusColor(activeSubscription.estActif)}`}>
                                    {activeSubscription.estActif ? 'Actif' : 'Inactif'}
                                </span>
                            </div>

                            <div className="subscription-dates">
                                <div className="date-item">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="date-text">
                                        {formatDate(activeSubscription.dateDébut)} - {formatDate(activeSubscription.dateFin)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {onViewSubscription && (
                            <button
                                onClick={() => onViewSubscription(Membre.id)}
                                className="btn btn--link btn--small transition-all duration-200 hover:text-blue-700"
                            >
                                Voir détails
                            </button>
                        )}
                    </div>
                )}

                {/* No Subscription Message */}






            </div>
        </div>
    );
};