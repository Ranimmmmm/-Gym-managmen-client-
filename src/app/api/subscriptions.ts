import { apiClient } from './base.api';
import {
  ApiResponse,
  //PaginatedResponse,
} from '../../types/api'; // adjust import paths if needed

import {
  Membre, Subscription, membersWithSubscriptions
} from '../../types/membre';
import { Abonnement } from '../../types/subscription';

interface SubscriptionFormData {
  membreId: number;
  typeSport: string;
  prixMensuel: number;
  dateDébut: string;
  dateFin: string;
}

interface RenewalData {
  subscriptionId: number;
  durationMonths: number;
}

export const subscriptionsApi = {
  getSubscriptions: (): Promise<Abonnement[]> => apiClient.get('/subscriptions'),
  createSubscription: (data: SubscriptionFormData) =>
    apiClient.post(
      `/subscriptions/${data.membreId}`,
      {
        memberId: data.membreId,
        typeSport: data.typeSport,
        prixMensuel: data.prixMensuel,
        dateDébut: data.dateDébut,
        durationMonths: 1
      }
    ),
  updateSubscription: (id: number, data: SubscriptionFormData): Promise<Abonnement> => (
    apiClient.put(`/subscriptions/${id}`, data)
  ),
  renewSubscription: (id: number, data: RenewalData): Promise<Abonnement> => (
    apiClient.put(`/subscriptions/${id}`, data)
  ),

  deleteSubscription: (id: number): Promise<void> => (
    apiClient.delete(`/subscriptions/${id}`)
  ),

  // Combined data endpoint
  getMembersWithSubscriptions: (): Promise<membersWithSubscriptions[]> => (
    apiClient.get('/members/with-subscriptions')
  ),
};












