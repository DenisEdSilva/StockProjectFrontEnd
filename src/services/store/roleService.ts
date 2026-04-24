import { api } from '@/lib/api';
import { RoleResponse, RoleFormData } from '@/types/role';
import { Permission } from '@/types/permission';

export const roleService = {
    async roleList(storeId: number, actualPage: number) {
        const response = await api.get<RoleResponse>(`/stores/${storeId}/roles`, {
            params: { actualPage }
        });
        return response.data;
    },

    async listAllPermissions() {
        const response = await api.get<Permission[]>('/permissions');
        return response.data;
    },

    async createRole(storeId: number, data: RoleFormData) {
        const response = await api.post(`/stores/${storeId}/roles`, data);
        return response.data;
    },

    async updateRole(storeId: number, roleId: number, data: Partial<RoleFormData>) {
        const response = await api.put(`/stores/${storeId}/roles/${roleId}`, data);
        return response.data;
    },

    async deleteRole(storeId: number, roleId: number) {
        const response = await api.delete(`/stores/${storeId}/roles/${roleId}`);
        return response.data;
    }
}