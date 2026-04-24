import { Permission } from './permission';

export interface Role {
    id: number;
    name: string;
    _count: {
        StoreUser: number;
        permissions: number;
    };
    permissions?: Permission[];
    createdAt: string;
}

export interface RoleResponse {
    data: Role[];
    pagination: {
        page: number,
        total: number;
        totalPages: number;
    };
}

export interface RoleFormData {
    name: string;
    permissionIds: number[];
}