'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/services/store/roleService'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DeleteRoleModalProps {
  roleId: number
  roleName: string
  storeId: number
  userCount: number
}

export function DeleteRoleModal({ roleId, roleName, storeId, userCount }: DeleteRoleModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync: deleteRoleFn, isPending } = useMutation({
    mutationFn: () => roleService.deleteRole(storeId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', storeId] })
      setOpen(false)
    },
    onError: () => alert("Não é possível excluir um cargo que possui usuários ativos.")
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-500/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <AlertDialogTitle>Excluir Cargo: {roleName}?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {userCount > 0 ? (
              <span className="text-red-400 font-medium">
                Atenção: Existem {userCount} utilizadores vinculados a este cargo. Ao excluir, eles perderão as permissões baseadas nesta função imediatamente.
              </span>
            ) : (
              "Esta ação removerá permanentemente o cargo e todas as suas associações de permissão desta unidade."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="border-t border-slate-800 pt-4 mt-4">
          <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => { e.preventDefault(); deleteRoleFn(); }}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-700 font-bold"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}