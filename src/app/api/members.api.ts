import { apiClient } from './base.api';
import { Membre, FormulaireMembre, membersWithSubscriptions } from '../../types/membre'
import { Abonnement } from '../../types/subscription'
import { ApiResponse } from '../../types/api';

export const membersApi = {
  getAll: async (): Promise<ApiResponse<Membre[]>> => {
    try {
      const data = await apiClient.get<any[]>('/members/all');
      // Map 'subscriptions' to 'subscriptions' for frontend compatibility
      const mapped = data.map(member => ({
        ...member,
        subscriptions: member.subscriptions || []
      }));
      return { data: mapped, message: 'Fetched successfully', success: true };
    } catch (error: any) {
      return { data: [], message: error.message, success: false };
    }
  },

  getWithSubscriptions: async (): Promise<ApiResponse<membersWithSubscriptions[]>> => {
    try {
      const data = await apiClient.get<any[]>('/members/with-subscriptions');
      const mapped = data.map(member => ({
        ...member,
        subscriptions: member.subscriptions || []
      }));
      return { data: mapped, message: 'Fetched successfully', success: true };
    } catch (error: any) {
      return { data: [], message: error.message, success: false };
    }
  },

  getUnpaid: (members: Membre[]): Membre[] => {
    const today = new Date();
    return members.filter(member =>
      !(member.subscriptions || []).some((sub: any) =>
        sub.estActif && new Date(sub.dateFin) >= today
      )
    );
  },

  getById: async (id: number): Promise<ApiResponse<Membre>> => {
    try {
      const data = await apiClient.get<Membre>(`/members/${id}`);
      return { data, message: 'Fetched successfully', success: true };
    } catch (error: any) {
      return { data: {} as Membre, message: error.message, success: false };
    }
  },

  create: async (data: FormulaireMembre): Promise<ApiResponse<Membre>> => {
    try {
      const result = await apiClient.post<Membre>('/members', data);
      return { data: result, message: 'Created successfully', success: true };
    } catch (error: any) {
      return { data: {} as Membre, message: error.message, success: false };
    }
  },

  update: async (id: number, data: Partial<FormulaireMembre>): Promise<ApiResponse<Membre>> => {
    try {
      const result = await apiClient.put<Membre>(`/members/${id}`, data);
      return { data: result, message: 'Updated successfully', success: true };
    } catch (error: any) {
      return { data: {} as Membre, message: error.message, success: false };
    }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete<void>(`/members/${id}`);
      return { data: undefined, message: 'Deleted successfully', success: true };
    } catch (error: any) {
      return { data: undefined, message: error.message, success: false };
    }
  },

  search: async (query: string): Promise<ApiResponse<Membre[]>> => {
    try {
      const data = await apiClient.get<Membre[]>(`/members/search?q=${encodeURIComponent(query)}`);
      return { data, message: 'Fetched successfully', success: true };
    } catch (error: any) {
      return { data: [], message: error.message, success: false };
    }
  },
};