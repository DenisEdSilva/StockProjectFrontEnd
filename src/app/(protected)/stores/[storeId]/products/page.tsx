'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { productService } from '@/services/store/productService'
import { useCan } from '@/hooks/useCan'
import { Loader2, Search, Inbox } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreateProductModal } from '@/components/store/product/CreateProductModal'
import { UpdateProductModal } from '@/components/store/product/UpdateProductModal'
import { DeleteProductModal } from '@/components/store/product/DeleteProductModal'

export default function ProductsPage() {
  const { storeId } = useParams()
  const id = Number(storeId)
  const { hasPermission } = useCan()

  const canCreate = hasPermission('POST', 'INVENTORY')
  const canEdit = hasPermission('PUT', 'INVENTORY')
  const canDelete = hasPermission('DELETE', 'INVENTORY')

  const { data, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.listProducts(id),
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Produtos</h1>
          <p className="text-slate-400 text-sm">Gerir o catálogo de itens desta unidade.</p>
        </div>
        
        {canCreate && (
          <CreateProductModal storeId={id} />
        )}
      </header>

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Buscar por nome ou SKU..." 
            className="pl-10 bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-slate-200 h-10"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-slate-800/40 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            <tr>
              <th className="w-4/12 px-6 py-4">Produto</th>
              <th className="w-3/12 px-6 py-4">Categoria</th>
              <th className="w-2/12 px-6 py-4">Preço</th>
              <th className="w-1/12 px-6 py-4 text-center">Estoque</th>
              <th className="w-2/12 px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                  <p className="text-slate-500 mt-2 text-xs uppercase font-bold tracking-widest">Carregando catálogo...</p>
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-500">
                  <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum produto encontrado.</p>
                </td>
              </tr>
            ) : data?.data.map((product) => (
              <tr key={product.id} className="group hover:bg-slate-800/30 transition-colors duration-150">
                
                <td className="px-6 py-4 truncate">
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors truncate">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase truncate">
                      {product.sku || 'SEM SKU'}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 truncate">
                  <span className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-800">
                    {product.category?.name || 'N/A'}
                  </span>
                </td>
                
                <td className="px-6 py-4 font-medium text-slate-200 truncate">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    product.stock <= 5 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'text-slate-400'
                  }`}>
                    {product.stock} un
                  </span>
                </td>

                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center justify-end w-full gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <UpdateProductModal product={product} storeId={id} />
                    )}
                    {canDelete && (
                      <DeleteProductModal productId={product.id} productName={product.name} storeId={id} />
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