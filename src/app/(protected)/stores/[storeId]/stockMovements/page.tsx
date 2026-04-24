'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { stockService } from '@/services/store/stockMovementService'
import { useCan } from '@/hooks/useCan'
import { 
  Loader2, ArrowUpCircle, ArrowDownCircle, 
  User, Store, RotateCcw, AlertTriangle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateStockMovementModal } from '@/components/store/stockMovements/CreateStockMovementModal'
import { StockMovement } from '@/types/stockMovement'
import { SVGProps } from 'react'
import { ProductImage } from '@/components/ui/image';

const movementTypeMap = {
  IN: 'ENTRADA',
  OUT: 'SAÍDA',
  TRANSFER: 'TRANSFERÊNCIA'
} as const;

export default function StockPage() {
  const { storeId } = useParams()
  const id = Number(storeId)
  const queryClient = useQueryClient()
  const { hasPermission } = useCan()

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', id],
    queryFn: () => stockService.listStockMovements(id),
    enabled: !!id,
  })

  const { mutateAsync: revertMovement, isPending: isReverting } = useMutation({
    mutationFn: (movementId: number) => stockService.revertMovement(id, movementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements', id] })
      alert('Movimentação revertida com sucesso!')
    },
    onError: () => {
      alert('Não foi possível reverter esta movimentação. Verifique o saldo em estoque.')
    }
  })

  const handleRevert = async (movement: StockMovement) => {
    const confirmed = window.confirm(
      `Deseja reverter a ${movementTypeMap[movement.type]} de ${movement.stock} unidades de ${movement.product.name}? \n\nEsta ação criará uma movimentação de estorno.`
    )
    
    if (confirmed) {
      await revertMovement(movement.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Histórico de Estoque</h1>
          <p className="text-slate-400 text-sm">Rastreabilidade total de entradas, saídas e transferências entre lojas.</p>
        </div>
        
        {hasPermission('POST', 'STOCK') && (
          <CreateStockMovementModal storeId={id} />
        )}
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Operação</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Qtd.</th>
                <th className="px-6 py-4">Responsável / Destino</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.data.map((movement: StockMovement) => {
                const isMovementValid = movement.isValid === true;

                return (
                  <tr 
                    key={movement.id} 
                    className={`group hover:bg-slate-800/30 transition-colors ${!isMovementValid ? 'opacity-40 grayscale-[0.8]' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-200">
                          {format(new Date(movement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {format(new Date(movement.createdAt), "HH:mm:ss")}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {movement.type === 'IN' && <ArrowUpCircle className="w-4 h-4 text-emerald-500" />}
                        {movement.type === 'OUT' && <ArrowDownCircle className="w-4 h-4 text-red-500" />}
                        {movement.type === 'TRANSFER' && <MoveHorizontal className="w-4 h-4 text-blue-500" />}
                        <span className="text-xs font-bold text-slate-300">
                          {movementTypeMap[movement.type]}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProductImage 
                          src={movement.product.banner} 
                          alt={movement.product.name} 
                        />
                        
                        <div className="flex flex-col max-w-45">
                          <span className="text-sm font-medium text-slate-200 truncate">
                            {movement.product.name}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">
                            {movement.product.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${movement.type === 'IN' ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.stock} un
                        </span>
                        <span className="text-[10px] text-slate-500">Saldo Anterior: {movement.previousStock}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <User className="w-3 h-3 text-amber-500/70" /> ID: {movement.createdBy}
                        </span>
                        {movement.destinationStore && (
                          <span className="flex items-center gap-1.5 text-[11px] text-blue-400 font-bold bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10 self-start">
                            <Store className="w-3 h-3" /> {movement.destinationStore.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {!isMovementValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500/80 uppercase tracking-widest italic bg-red-500/5 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" /> Revertido
                        </span>
                      ) : (
                        hasPermission('PATCH', 'STOCK') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isReverting}
                            onClick={() => handleRevert(movement)}
                            className="h-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 gap-2 text-[10px] font-bold uppercase tracking-tight"
                          >
                            <RotateCcw className="w-3 h-3" /> Reverter
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && data?.data.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 text-sm italic">O histórico de movimentações está vazio.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MoveHorizontal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 8 4 4-4 4" />
      <path d="M2 12h20" />
      <path d="m6 8-4 4 4 4" />
    </svg>
  )
}