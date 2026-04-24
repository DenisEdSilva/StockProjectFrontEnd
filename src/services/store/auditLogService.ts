import { api } from '@/lib/api';
import { AuditLogsResponse } from '@/types/auditLog'

export const auditLogService = {
    async auditLogList(storeId: number, actualPage: number) {
        const response = await api.get<AuditLogsResponse>(`/stores/${storeId}/auditLogs`, {
            params: { page: actualPage }
        });
        return response.data;
    }
}