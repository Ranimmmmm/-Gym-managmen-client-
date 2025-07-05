export interface Abonnement {
  id: number;
  membreId: number;
  typeSport: TypeAbonnement;
  dateDébut: string;
  dateFin: string;
  prixMensuel: number;
  estActif: boolean;
  statut: StatutAbonnement;
  paiement: StatutPaiement;
}

export type TypeAbonnement = 'Basique' | 'Standard' | 'Premium';
export type StatutAbonnement = 'actif' | 'expiré' | 'suspendu';
export type StatutPaiement = 'payé' | 'impayé';

export interface FormulaireAbonnement {
  id: number,
  typeSport: TypeAbonnement;
  dateDébut: string;
  dateFin: string;
  estActif: boolean;
  prixMensuel: number;
}