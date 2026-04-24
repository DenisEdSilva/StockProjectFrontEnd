'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/store/categoryService'
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

interface DeleteCategoryModalProps {
  categoryId: number
  categoryName: string
  storeId: number
}

export function DeleteCategoryModal({ categoryId, categoryName, storeId }: DeleteCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: deleteCategory, isPending } = useMutation({
    mutationFn: () => categoryService.deleteCategory(storeId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] })
      setOpen(false)
    },
    onError: () => alert("Erro ao excluir a categoria.")
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-card border-border text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            A categoria <strong className="text-slate-100">{categoryName}</strong> será removida. 
            Esta ação pode ser revertida apenas pelo administrador do banco de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex row gap-0 sm:space-x-0 border-t border-border">
          <AlertDialogCancel 
            className="flex-1 p-6 rounded-t-none rounded-br-none border-none bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              deleteCategory();
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