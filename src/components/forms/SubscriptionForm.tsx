import React, { useState } from 'react';
import { Subscription } from '@/types/membre';
import { Button } from '@/app/common/Button';
import { Modal } from '@/app/common/Modal';

interface SubscriptionFormData {
    membreId: number;
    typeSport: string;
    prixMensuel: number;
    dateDébut: string;
    dateFin: string;
}

interface SubscriptionFormProps {
    subscription?: Subscription | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SubscriptionFormData) => Promise<void>;
    members: Array<{ id: number; prenom: string; nom: string }>;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
    subscription,
    isOpen,
    onClose,
    onSave,
    members,
}) => {
    const [formData, setFormData] = useState<SubscriptionFormData>({
        membreId: subscription?.membreId || 0,
        typeSport: subscription?.typeSport || '',
        prixMensuel: subscription?.prixMensuel || 0,
        dateDébut: subscription?.dateDébut || '',
        dateFin: subscription?.dateFin || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof SubscriptionFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const sportTypes = [
        'Karaté',
        'Musculation',
        'Box',
        'Aerobic',
        'Cardio',
        'CrossFit'
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {subscription ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
                </h2>

                <div>
                    <label className="form-label">Membre</label>
                    <select
                        value={formData.membreId}
                        onChange={(e) => handleChange('membreId', parseInt(e.target.value))}
                        className="form-input"
                        required
                    >
                        <option value="">Sélectionner un membre</option>
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.prenom} {member.nom}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="form-label">Type de sport</label>
                    <select
                        value={formData.typeSport}
                        onChange={(e) => handleChange('typeSport', e.target.value)}
                        className="form-input"
                        required
                    >
                        <option value="">Sélectionner un type</option>
                        {sportTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="form-label">Prix mensuel (DT)</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={formData.prixMensuel}
                        onChange={(e) => handleChange('prixMensuel', parseFloat(e.target.value))}
                        className="form-input"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Date de début</label>
                        <input
                            type="date"
                            value={formData.dateDébut}
                            onChange={(e) => handleChange('dateDébut', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Date de fin</label>
                        <input
                            type="date"
                            value={formData.dateFin}
                            onChange={(e) => handleChange('dateFin', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" loading={loading} className="flex-1 transition-all duration-200">
                        {subscription ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button variant="secondary" onClick={onClose} className="flex-1 transition-all duration-200">
                        Annuler
                    </Button>
                </div>
            </form>
        </Modal>
    );
}; 