import { api } from "@/lib/api";
import { StockResponse, CreateStockRequest, StockMovement, TransferDestination } from "@/types/stockMovement";

export const stockService = {
  async listStockMovements(storeId: number, page = 1) {
    const response = await api.get<StockResponse>(`/stores/${storeId}/stock/movements`, {
      params: { page }
    });
    return response.data;
  },

  async getTransferDestinations(storeId: number) {
    const response = await api.get<{ stores: TransferDestination[] }>(
      `/stores/${storeId}/transfer-targets`
    );
    return response.data.stores;
  },

  async createMovement(storeId: number, data: CreateStockRequest) {
    const response = await api.post<StockMovement>(`/stores/${storeId}/stock/movements`, data);
    return response.data;
  },

  async revertMovement(storeId: number, movementId: number) {
    const response = await api.patch<{ message: string; id?: number }>(
      `/stores/${storeId}/stock/movements/${movementId}/revert`
    );
    return response.data;
  }
};