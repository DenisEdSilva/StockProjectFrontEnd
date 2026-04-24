'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeUserService } from '@/services/store/storeUserService'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, UserX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DeleteStoreUserModalProps {
  userId: number
  userName: string
  storeId: number
}

export function DeleteStoreUserModal({ userId, userName, storeId }: DeleteStoreUserModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync: deleteUserFn, isPending } = useMutation({
    mutationFn: () => storeUserService.deleteStoreUser(storeId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] })
      setOpen(false)
    }
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
            <UserX className="w-6 h-6 text-red-500" />
          </div>
          <AlertDialogTitle>Remover membro da equipe?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Deseja realmente revogar o acesso de <strong className="text-slate-200">{userName}</strong>? 
            Esta ação pode ser revertida apenas por um administrador ou proprietário.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="border-t border-slate-800 pt-4 mt-4">
          <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => { e.preventDefault(); deleteUserFn(); }}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-700 font-bold"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remover Membro"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}