'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stockService } from '@/services/store/stockMovementService'
import { productService } from '@/services/store/productService'
import { CreateStockRequest } from '@/types/stockMovement'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Loader2, PlusCircle, ArrowUpCircle, 
  ArrowDownCircle, MoveHorizontal, AlertCircle 
} from "lucide-react"
import { Product } from '@/types/product'
import { useCan } from '@/hooks/useCan'

const stockMovementSchema = z.object({
  type: z.enum(['IN', 'OUT', 'TRANSFER'] as const),
  productId: z.number().min(1, "Selecione um produto"),
  stock: z.number().min(1, "A quantidade deve ser positiva"),
  destinationStoreId: z.number().optional().nullable()
}).refine((data) => {
  if (data.type === 'TRANSFER' && !data.destinationStoreId) {
    return false;
  }
  return true;
}, {
  message: "Loja de destino é obrigatória para transferências",
  path: ["destinationStoreId"]
})

type StockMovementFormData = z.infer<typeof stockMovementSchema>

export function CreateStockMovementModal({ storeId }: { storeId: number }) {
  const [open, setOpen] = useState(false)
  const { hasPermission  } = useCan();
  const queryClient = useQueryClient()

  const canViewTransferTargets = hasPermission('GET', "TRANSFER")

  const movementTypes = [
    'IN',
    'OUT',
    ...(hasPermission('GET', 'TRANSFER') ? ['TRANSFER'] : [])
  ] as const

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { type: 'IN', stock: 1, productId: 0 }
  })

  const selectedType = useWatch({ control, name: 'type', defaultValue: 'IN' })

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-select', storeId],
    queryFn: () => productService.listProducts(storeId, 1, ""),
    enabled: open
  })

  const { data: transferTargets, isLoading: isLoadingTargets } = useQuery({
    queryKey: ['transfer-targets', storeId],
    queryFn: () => stockService.getTransferDestinations(storeId),
    enabled: open && selectedType === 'TRANSFER' && canViewTransferTargets
  })

  const { mutateAsync: createMovementFn, isPending } = useMutation({
    mutationFn: (data: StockMovementFormData) => {
      const payload: CreateStockRequest = {
        type: data.type,
        productId: data.productId,
        stock: data.stock,
        destinationStoreId: data.type === 'TRANSFER' ? data.destinationStoreId : undefined
      }
      return stockService.createMovement(storeId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements', storeId] })
      setOpen(false)
      reset()
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold gap-2">
          <PlusCircle className="w-4 h-4" /> Nova Movimentação
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125 bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MoveHorizontal className="w-5 h-5 text-amber-500" />
            Movimentação de Estoque
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => createMovementFn(data))} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tipo de Operação</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {movementTypes.map((t) => (
                <label key={t} className={`flex flex-col items-center justify-center py-3 rounded-md cursor-pointer transition-all border ${selectedType === t ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                  <input type="radio" {...register('type')} value={t} className="hidden" />
                  {t === 'IN' && <ArrowUpCircle className="w-5 h-5 mb-1" />}
                  {t === 'OUT' && <ArrowDownCircle className="w-5 h-5 mb-1" />}
                  {t === 'TRANSFER' && <MoveHorizontal className="w-5 h-5 mb-1" />}
                  <span className="text-[10px] font-bold tracking-tighter">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Produto</label>
              <select {...register('productId', { valueAsNumber: true })} className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm focus:ring-1 focus:ring-amber-500 outline-none disabled:opacity-50">
                <option value={0}>{isLoadingProducts ? 'Carregando...' : 'Selecione o produto...'}</option>
                {productsData?.data.map((p: Product) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              {errors.productId && <p className="text-[10px] text-red-500 uppercase font-bold">{errors.productId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Quantidade</label>
                <Input {...register('stock', { valueAsNumber: true })} type="number" className="px-3 h-10  bg-slate-950 border-slate-800 focus:border-amber-500" />
                {errors.stock && <p className="text-[10px] text-red-500 uppercase font-bold">{errors.stock.message}</p>}
              </div>

              {selectedType === 'TRANSFER' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                  <label className="text-xs font-bold uppercase text-blue-400 tracking-widest">Loja Destino</label>
                  <select {...register('destinationStoreId', { valueAsNumber: true })} className="w-full h-10 px-3 rounded-md bg-slate-950 border border-blue-900/30 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50">
                    <option value="">{isLoadingTargets ? 'Buscando lojas...' : 'Destino...'}</option>
                    {transferTargets?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                  {errors.destinationStoreId && <p className="text-[10px] text-red-500 uppercase font-bold">{errors.destinationStoreId.message}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/10 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">Esta ação atualizará o estoque imediatamente.</p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold uppercase tracking-widest">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Movimentação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}