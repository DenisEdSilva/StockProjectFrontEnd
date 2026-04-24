export interface Product {
  id: number;
  storeInventoryId: number;
  name: string;
  price: string;
  stock: number;
  banner: string | null;
  sku: string;
  description: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

export interface CreateProductDTO {
  banner?: string;
  name: string;
  categoryId: number;
  price: string | number;
  description?: string;
  sku?: string;
}

export interface UpdateProductDTO {
  banner?: string;
  name?: string;
  categoryId?: number;
  price?: string | number;
  description?: string;
  sku?: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}