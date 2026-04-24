export interface Store {
    id: number;
    name: string;
    city: string;
    state: string;
    zipCode: string;
    _count: {
        products: number;
        categories: number;
        storeUsers: number;
    }
}

export interface ListStoresResponse {
    stores: Store[]
}

export interface StoreFormData {
    name: string,
    city: string,
    state: string,
    zipCode: string,
}