import { api } from "@/lib/api";
import { CategoriesResponse } from '@/types/category'


export const categoryService = {
  async listCategory(storeId: number, page = 1) {
    const response = await api.get<CategoriesResponse>(`/stores/${storeId}/categories`, {
      params: { page }
    });
    return response.data;
  },

  async getCategory(storeId: number, categoryId: number) {
    const response = await api.get(`/stores/${storeId}/categories/${categoryId}`);
    return response.data;
  },

  async createCategory(storeId: number, name: string) {
    const response = await api.post(`/stores/${storeId}/categories`, { name });
    return response.data;
  },

  async updateCategory(storeId: number, categoryId: number, name: string) {
    const response = await api.put(`/stores/${storeId}/categories/${categoryId}`, { name });
    return response.data;
  },

  async deleteCategory(storeId: number, categoryId: number) {
    await api.delete(`/stores/${storeId}/categories/${categoryId}`);
  },

};