// Interfaces pour les membres
export interface Membre {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateInscription: string;
  typeSport: string;
  dateDebut: string;
  subscriptions?: Subscription[];
  paiements?: Paiement[];
  datedenaissence?: string;
  telParent?: string;
}

export interface FormulaireMembre {
  prenom: string;
  nom: string;
  telephone: string;
  adresse: string;
  datedenaissence?: string;
  telParent?: string;
  dateInscription: string;
}

export interface CreationMembreData extends FormulaireMembre {
  // Ajoutez d'autres champs si nécessaire
}

export interface MiseAJourMembreData extends Partial<FormulaireMembre> {
  id: number;
}

export interface membersWithSubscriptions extends Membre {
  subscriptions?: Subscription[];
}


export interface Subscription {
  id: number;
  membreId: number;
  typeSport: string;  // "Musculation", "Karaté", etc.
  prixMensuel: number;
  dateDébut: string;
  dateFin: string;
  estActif: boolean;
  paiements?: Paiement[];
}

export interface Paiement {
  id: number;
  montant: number;
  methodePaiement: string;  // "Carte", "Espèces", etc.
  datePaiement: string;
  membreId: number;
  abonnementId: number;
}