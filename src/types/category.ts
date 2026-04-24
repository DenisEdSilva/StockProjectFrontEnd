export interface Category {
  id: number;
  name: string;
  storeId: number;
  createdAt: string;
  productsCount: number;
}

export interface CategoriesResponse {
  data: Category[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
