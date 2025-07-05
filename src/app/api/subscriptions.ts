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
  renewSubscription: (id: number, data: Partial<SubscriptionFormData>): Promise<Abonnement> => (
    apiClient.put(`/subscriptions/${id}`, data)
  ),

  // Combined data endpoint
  getMembersWithSubscriptions: (): Promise<membersWithSubscriptions[]> => (
    apiClient.get('/members/with-subscriptions')
  ),
};












