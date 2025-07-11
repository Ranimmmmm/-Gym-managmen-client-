import React, { useState, useEffect } from 'react';
import { Membre, FormulaireMembre } from '@/types/membre';
import { Button } from '@/app/common/Button';
import { Modal } from '@/app/common/Modal'

interface MemberFormProps {
    member?: Membre | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormulaireMembre) => Promise<Membre>;
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
        dateInscription: member?.dateInscription || '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Reset form data when member changes (for editing)
    useEffect(() => {
        setFormData({
            nom: member?.nom || '',
            prenom: member?.prenom || '',
            telephone: member?.telephone || '',
            adresse: member?.adresse || '',
            datedenaissence: member?.datedenaissence || '',
            telParent: member?.telParent || '',
            dateInscription: member?.dateInscription || '',
        });
        setErrors({});
    }, [member, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit called', formData);
        // Custom validation for phone number
        const phoneDigits = formData.telephone.replace(/\D/g, '');
        const newErrors: { [key: string]: string } = {};
        if (!phoneDigits || phoneDigits.length !== 8) {
            newErrors.telephone = 'Le numéro de téléphone doit contenir exactement 8 chiffres.';
        } else if (!/^\d{8}$/.test(phoneDigits)) {
            newErrors.telephone = 'Le numéro de téléphone ne doit contenir que des chiffres.';
        }
        if (!formData.nom) {
            newErrors.nom = 'Le nom est obligatoire.';
        }
        if (!formData.prenom) {
            newErrors.prenom = 'Le prénom est obligatoire.';
        }
        if (!formData.adresse) {
            newErrors.adresse = "L'adresse est obligatoire.";
        }
        if (!formData.datedenaissence) {
            newErrors.datedenaissence = 'La date de naissance est obligatoire.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            console.log('Calling onSave with:', formData);
            const result = await onSave(formData);
            // Only close modal if result has a valid id
            if (result && result.id) {
                onClose();
            } else {
                setErrors({ form: "Erreur lors de la création du membre. Veuillez vérifier les champs obligatoires et réessayer." });
            }
        } catch (error: any) {
            setErrors({ form: error?.message || "Erreur lors de la création du membre. Veuillez vérifier les champs obligatoires et réessayer." });
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
                    {errors.telephone && (
                        <div className="text-red-500 text-sm mt-1">{errors.telephone}</div>
                    )}
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
                    <label className="form-label">Date de naissance <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        value={formData.datedenaissence}
                        onChange={(e) => handleChange('datedenaissence', e.target.value)}
                        className="form-input"
                        required
                    />
                    {errors.datedenaissence && (
                        <div className="text-red-500 text-sm mt-1">{errors.datedenaissence}</div>
                    )}
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
                            value={formData.dateInscription}
                            onChange={(e) => handleChange('dateInscription', e.target.value)}
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
                {errors.form && (
                    <div className="text-red-500 text-sm mt-1">{errors.form}</div>
                )}
            </form>
        </Modal>
    );
};