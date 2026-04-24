import { api } from '@/lib/api';
import { StoreUserResponse, StoreUserFormData } from '@/types/storeUser';

export const storeUserService = {
    async storeUserListByStoreId(storeId: number, actualPage: number) {
        const response = await api.get<StoreUserResponse>(`/stores/${storeId}/users`, {
            params: { actualPage }
        });
        return response.data;
    },

    async createStoreUser(storeId: number, data: StoreUserFormData) {
        const response = await api.post(`/stores/${storeId}/users`, data);
        return response.data;
    },

    async updateStoreUser(storeId: number, userId: number, data: Partial<StoreUserFormData>) {
        const response = await api.put(`/stores/${storeId}/users/${userId}`, data);
        return response.data;
    },

    async deleteStoreUser(storeId: number, userId: number) {
        const response = await api.delete(`/stores/${storeId}/users/${userId}`);
        return response.data;
    }
}