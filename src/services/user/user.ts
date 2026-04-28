import { api } from '@/lib/api';
import { UserProfile } from '@/types/user';

export const userService = {
    async getUserProfile() {
        const response = await api.get<UserProfile>('/me');
        return response.data;
    },

    async updateUserProfile(userId: number, data: Partial<UserProfile>) {
        const response = await api.put(`/me/${userId}`, data);
        return response.data;
    },

    async updateStoreUserProfile(storeId: number, data: Partial<UserProfile>) {
        const response = await api.put<UserProfile>(`/stores/${storeId}/me`, data);
        return response.data;
    },
}
