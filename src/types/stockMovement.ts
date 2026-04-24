export type MovementType = 'IN' | 'OUT' | 'TRANSFER';

export interface StockMovement {
  id: number;
  type: MovementType;
  stock: number;
  previousStock: number;
  createdBy: number;
  createdAt: string;
  isValid: boolean;
  destinationStoreId: number | null;
  productId: number;
  storeId: number;
  product: {
    name: string;
    sku: string;
    banner: string | null;
  };
  destinationStore: { name: string } | null;
}

export interface TransferDestination {
  id: number;
  name: string;
  city: string;
  state: string;
}

export interface CreateStockRequest {
  type: MovementType;
  productId: number;
  stock: number;
  destinationStoreId?: number | null;
}

export interface StockResponse {
  data: StockMovement[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
}