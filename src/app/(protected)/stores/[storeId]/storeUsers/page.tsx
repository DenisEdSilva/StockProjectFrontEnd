'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { storeUserService } from '@/services/store/storeUserService'
import { useCan } from '@/hooks/useCan'
import { Loader2, Search, UserCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { CreateStoreUserModal } from '@/components/store/storeUser/CreateStoreUserModal'
import { UpdateStoreUserModal } from '@/components/store/storeUser/UpdateStoreUserModal'
import { DeleteStoreUserModal } from '@/components/store/storeUser/DeleteStoreUserModal'

export default function UsersPage() {
  const { storeId, page } = useParams()
  const id = Number(storeId)
  const actualPage = Number(page) || 1
  const { hasPermission } = useCan()

  const { data, isLoading } = useQuery({
    queryKey: ['store-users', id],
    queryFn: () => storeUserService.storeUserListByStoreId(id, actualPage),
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Equipe</h1>
          <p className="text-slate-400 text-sm">Gerencie os colaboradores da unidade e seus níveis de acesso.</p>
        </div>

        {hasPermission('POST', 'STORE_USER') && (
          <CreateStoreUserModal storeId={id} />
        )}
      </header>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Pesquisar por nome ou e-mail..." 
            className="pl-10 bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-slate-100"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Membro</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Cargo / Role</th>
              <th className="px-6 py-4">Admitido em</th>
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
            ) : data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <UserCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {user.role?.name || 'Sem Cargo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {hasPermission('PUT', 'STORE_USER') && (
                      <UpdateStoreUserModal storeId={id} user={user} />
                    )}
                    
                    {hasPermission('DELETE', 'STORE_USER') && (
                      <DeleteStoreUserModal storeId={id} userId={user.id} userName={user.name} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && data?.data.length === 0 && (
          <div className="py-20 text-center border-t border-slate-800">
            <p className="text-slate-500 text-sm">Nenhum membro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}