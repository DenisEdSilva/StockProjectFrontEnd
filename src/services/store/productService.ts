import { api } from '@/lib/api';
import { Product, CreateProductDTO, ProductsResponse, UpdateProductDTO } from '@/types/product';

export const productService = {
  async listProducts(storeId: number, page = 1, search = "") {
    const response = await api.get<ProductsResponse>(`/stores/${storeId}/products`, {
      params: { page, search }
    });
    return response.data;
  },

  async getProduct(storeId: number, productId: number) {
    const response = await api.get<Product>(`/stores/${storeId}/products/${productId}`);
    return response.data;
  },

  async createProduct(storeId: number, data: CreateProductDTO) {
    const response = await api.post<Product>(`/stores/${storeId}/products`, data);
    return response.data;
  },

  async updateProduct(storeId: number, productId: number, data: UpdateProductDTO) {
    const response = await api.put<Product>(`/stores/${storeId}/products/${productId}`, data);
    return response.data;
  },

  async deleteProduct(storeId: number, productId: number, isGlobal: boolean = false) {
    await api.delete(`/stores/${storeId}/products/${productId}`, {
      params: { isGlobal }
    });
  },  
};