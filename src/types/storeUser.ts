import { Permission } from './permission';
import { Role } from './role';

export interface StoreUser {
    id: number;
    name: string;
    email: string;
    roleId: number;
    role: Role; 
    userPermissions?: Permission[]; 
    createdAt: string;
}

export interface StoreUserResponse {
    data: StoreUser[];
    pagination: {
        page: number;
        total: number;
        totalPages: number;
    };
}

export interface StoreUserFormData {
    name: string;
    email: string;
    password?: string;
    roleId: number;
    permissionIds: number[];
}