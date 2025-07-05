import React, { useState } from 'react';
import { Membre, FormulaireMembre } from '@/types/membre';
import { Button } from '@/app/common/Button';
import { Modal } from '@/app/common/Modal'

interface MemberFormProps {
    member?: Membre | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormulaireMembre) => Promise<void>;
}

export const MemberForm: React.FC<MemberFormProps> = ({
    member,
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<FormulaireMembre>({
        nom: member?.nom || '',
        prenom: member?.prenom || '',
        telephone: member?.telephone || '',
        adresse: member?.adresse || '',
        datedenaissence: member?.datedenaissence || '',
        telParent: member?.telParent || '',
        dateDebut: member?.dateDebut || '',
    });
    const [loading, setLoading] = useState(false);










    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving member:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FormulaireMembre, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {member ? 'Modifier le membre' : 'Nouveau membre'}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Nom</label>
                        <input
                            type="text"
                            placeholder="Nom"
                            value={formData.nom}
                            onChange={(e) => handleChange('nom', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Prénom</label>
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={formData.prenom}
                            onChange={(e) => handleChange('prenom', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="form-label">Téléphone</label>
                    <input
                        type="tel"
                        placeholder="Téléphone"
                        value={formData.telephone}
                        onChange={(e) => handleChange('telephone', e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label className="form-label">Adresse</label>
                    <input
                        type="text"
                        placeholder="Adresse"
                        value={formData.adresse}
                        onChange={(e) => handleChange('adresse', e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label className="form-label">Date de naissance (optionnel)</label>
                    <input
                        type="date"
                        value={formData.datedenaissence}
                        onChange={(e) => handleChange('datedenaissence', e.target.value)}
                        className="form-input"
                    />
                </div>

                <div>
                    <label className="form-label">Téléphone du parent (optionnel)</label>
                    <input
                        type="tel"
                        placeholder="Téléphone du parent"
                        value={formData.telParent || ''}
                        onChange={(e) => handleChange('telParent', e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="form-label">
                    <div>
                    </div>
                    <div>
                        <label className="form-label">Date de début</label>
                        <input
                            type="date"
                            value={formData.dateDebut}
                            onChange={(e) => handleChange('dateDebut', e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" loading={loading} className="flex-1 transition-all duration-200">
                        {member ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button variant="secondary" onClick={onClose} className="flex-1 transition-all duration-200">
                        Annuler
                    </Button>
                </div>
            </form>
        </Modal>
    );
};