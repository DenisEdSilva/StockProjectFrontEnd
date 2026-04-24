export type UserType = 'OWNER' | 'STORE_USER';

export interface Permissions {
    action: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    resource: 'STORE' | 'ROLE' | 'STORE_USER' | 'CATEGORY' | 'PRODUCT' | 'STOCK' | 'AUDIT_LOG';
}

export interface User {
    id: number;
    name: string;
    email: string;
    type: UserType;
    storeId?: number;
    roleId?: number;
    ownedStores?: Array<{
        id: number;
        name: string;
    }>;
    permissions: Permissions[];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface SignInCredentials {
    email: string;
    password: string;
}