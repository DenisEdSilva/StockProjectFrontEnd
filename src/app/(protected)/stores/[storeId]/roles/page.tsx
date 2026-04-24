'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { roleService } from '@/services/store/roleService'
import { useCan } from '@/hooks/useCan'
import { Loader2, ShieldCheck, Users, Key } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateRoleModal } from '@/components/store/role/CreateRoleModal'
import { UpdateRoleModal } from '@/components/store/role/UpdateRoleModal'
import { DeleteRoleModal } from '@/components/store/role/DeleteRoleModal'

export default function RolesPage() {
  const { storeId, page } = useParams()
  const id = Number(storeId)
  const actualPage = Number(page) || 1
  const { hasPermission } = useCan()

  const { data, isLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.roleList(id, actualPage),
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cargos e Níveis</h1>
          <p className="text-slate-400 text-sm">Gerencie as funções e o escopo de permissões da unidade.</p>
        </div>

        {hasPermission('POST', 'ROLE') && (
          <CreateRoleModal storeId={id} />
        )}
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nome do Cargo</th>
              <th className="px-6 py-4">Membros Vinculados</th>
              <th className="px-6 py-4">Total de Permissões</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                </td>
              </tr>
            ) : data?.data.map((role) => (
              <tr key={role.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="font-medium">{role.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{role._count?.StoreUser || 0} usuários</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Key className="w-4 h-4" />
                    <span className="text-sm">{role._count?.permissions || 0} regras</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {format(new Date(role.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {hasPermission('PUT', 'ROLE') && (
                      <UpdateRoleModal storeId={id} role={role} />
                    )}
                    
                    {hasPermission('DELETE', 'ROLE') && (
                      <DeleteRoleModal storeId={id} roleId={role.id} roleName={role.name} userCount={role._count?.StoreUser || 0} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}