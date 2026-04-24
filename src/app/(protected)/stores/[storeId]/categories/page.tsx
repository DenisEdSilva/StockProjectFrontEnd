'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { categoryService } from '@/services/store/categoryService'
import { useCan } from '@/hooks/useCan'
import { CreateCategoryModal } from '@/components/store/category/CreateCategoryModal'
import { UpdateCategoryModal } from '@/components/store/category/UpdateCategoryModal'
import { DeleteCategoryModal } from '@/components/store/category/DeleteCategoryModal'
import { Loader2, Search, Inbox } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CategoriesPage() {
  const { storeId } = useParams()
  const id = Number(storeId)
  const { hasPermission } = useCan()

  const canCreate = hasPermission('POST', 'CATEGORY')
  const canEdit = hasPermission('PUT', 'CATEGORY')
  const canDelete = hasPermission('DELETE', 'CATEGORY')

  const { data, isLoading } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.listCategory(id),
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Categorias</h1>
          <p className="text-slate-400 text-sm">Gerencie os grupos de produtos da sua unidade.</p>
        </div>
        {canCreate && <CreateCategoryModal storeId={id} />}
      </header>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Pesquisar categorias..." 
            className="pl-10 bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-slate-200 h-10"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-slate-800/40 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="w-9/12 px-6 py-4">Nome</th>
              <th className="w-2/12 px-6 py-4">Produtos Vinculados</th>
              <th className="w-1/12 px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                  <p className="text-slate-500 mt-2 text-xs uppercase font-bold tracking-widest">Carregando categorias...</p>
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-20 text-center text-slate-500">
                  <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhuma categoria encontrada.</p>
                  <p className="text-xs mt-1">Crie sua primeira categoria para organizar seus produtos.</p>
                </td>
              </tr>
            ) : data?.data.map((category) => (
              
              <tr key={category.id} className="group hover:bg-slate-800/30 transition-colors duration-150">
                <td className="px-6 py-4">
                  <span className="text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                    {category.name}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="inline-flex items-center justify-center px-4 py-0.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-400">
                    {category.productsCount || 0} {(category.productsCount === 1) ? 'produto' : 'produtos'}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <UpdateCategoryModal 
                        category={category} 
                        storeId={id} 
                      />
                    )}
                    {canDelete && (
                      <DeleteCategoryModal 
                        categoryId={category.id} 
                        categoryName={category.name} 
                        storeId={id} 
                      />
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