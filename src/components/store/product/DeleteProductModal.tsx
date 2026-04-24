'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/store/productService'
import { useCan } from '@/hooks/useCan'
import {
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DeleteProductModalProps {
  productId: number
  productName: string
  storeId: number
}

export function DeleteProductModal({ productId, productName, storeId }: DeleteProductModalProps) {
  const [open, setOpen] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const queryClient = useQueryClient();
  
  const { hasPermission } = useCan()
  const canDeleteCatalog = hasPermission('DELETE', 'CATALOG')

  const { mutateAsync: deleteProductFn, isPending } = useMutation({
    mutationFn: () => productService.deleteProduct(storeId, productId, isGlobal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
      setOpen(false)
      setIsGlobal(false)
    },
    onError: () => alert("Erro ao excluir o produto. Ele pode estar vinculado a movimentações de estoque.")
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" size="icon" 
          className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-card border-border text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Produto?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground flex flex-col gap-4">
            <span>
              O produto <strong className="text-slate-100">{productName}</strong> será removido do inventário desta unidade.
            </span>
            
            {canDeleteCatalog && (
              <label className="flex items-center gap-2 p-3 border border-red-500/20 bg-red-500/5 rounded-md cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="accent-red-500 w-4 h-4"
                />
                <span className="text-xs text-red-200 font-medium">
                  <strong>Atenção:</strong> Excluir definitivamente de todas as lojas da rede (Matriz)
                </span>
              </label>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex row gap-0 sm:space-x-0 border-t border-border mt-4">
          <AlertDialogCancel className="flex-1 p-6 rounded-t-none rounded-br-none border-none bg-slate-800 hover:bg-slate-700 font-semibold">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              deleteProductFn();
            }}
            disabled={isPending}
            className="flex-1 p-6 rounded-t-none rounded-bl-none border-none bg-red-600 text-white hover:bg-red-700 font-semibold"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}