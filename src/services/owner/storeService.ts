import { api } from '@/lib/api';
import { ListStoresResponse, Store, StoreFormData } from '@/types/store';

export const storeService ={ 
    listMyStores: async ():Promise<Store[]> => {
        const response = await api.get<ListStoresResponse>('/stores');
        return response.data.stores;
    },

    async createStore(data: StoreFormData) {
        const response = await api.post('/stores', data);
        return response.data;
    },

    async getStoreById(storeId: number) {
        const response = await api.get(`/stores/${storeId}`)
        return response.data
    },

    async updateStore(storeId: number, data: StoreFormData) {
        const response = await api.put(`/stores/${storeId}`, data);
        return response.data;
    },

    async deleteStore(storeId: number) {
        await api.delete(`/stores/${storeId}`);
    }
}