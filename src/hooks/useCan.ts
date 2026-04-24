import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

type Action = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Resource = 'CATEGORY' | 'CATALOG' | 'INVENTORY' | 'STOCK' | 'AUDIT_LOG' | 'STORE_USER' | 'STORE' | 'ROLE' | 'TRANSFER';

export function useCan() {
  const { user } = useContext(AuthContext);

  const hasPermission = (action: Action, resource: Resource) => {
    if (!user) {
        return false;
    };

    if (user.type === 'OWNER') {
        return true;
    };
    
    return user.permissions?.some(
        (p) => p.action === action && p.resource === resource
    );
  };

  const canView = (resource: Resource) => hasPermission('GET', resource);

  return { hasPermission, canView, userType: user?.type };
}