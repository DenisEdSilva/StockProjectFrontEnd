'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/services/store/roleService'
import { Permission } from '@/types/permission'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Loader2, ShieldPlus } from "lucide-react"
import { isAxiosError } from 'axios'

const roleSchema = z.object({
  name: z.string().min(3, "O nome do cargo deve ter pelo menos 3 caracteres"),
  permissionIds: z.array(z.number()).min(1, "Selecione pelo menos uma permissão para este cargo"),
})

type RoleFormData = z.infer<typeof roleSchema>

interface CreateRoleModalProps {
  storeId: number
}

export function CreateRoleModal({ storeId }: CreateRoleModalProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const queryClient = useQueryClient()

  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.listAllPermissions(),
    enabled: open
  })

  const { register, handleSubmit, control, formState: { errors }, reset, getValues } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', permissionIds: [] }
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const values = getValues();
      const isDirty = values.name.trim() !== '' || values.permissionIds.length > 0;
      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
      reset();
    }
    setOpen(isOpen);
  }

  const { mutateAsync: createRoleFn, isPending } = useMutation({
    mutationFn: (data: RoleFormData) => roleService.createRole(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', storeId] })
      setOpen(false)
      reset()
    }
  })

  async function handleCreateRole(data: RoleFormData) {
    try {
      await createRoleFn(data)
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        alert("Já existe um cargo com este nome nesta unidade.")
      } else {
        alert("Ocorreu um erro ao criar o cargo.")
      }
    }
  }

  const groupedPermissions = permissionsData?.reduce((acc: Record<string, Permission[]>, curr: Permission) => {
    const group = curr.resource || 'OUTROS';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold gap-2">
            <Plus className="w-4 h-4" /> Novo Cargo
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-250 bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <ShieldPlus className="w-5 h-5 text-amber-500" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Criar Novo Cargo</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateRole)} className="space-y-6 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nome do Cargo</label>
              <Input 
                {...register('name')} 
                placeholder="Ex: Gerente de Estoque" 
                className="bg-slate-950 border-slate-800 focus:border-amber-500" 
              />
              {errors.name && <p className="text-[10px] text-red-500 uppercase">{errors.name.message}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Atribuição de Permissões</label>
                {errors.permissionIds && <p className="text-[10px] text-red-500 uppercase">{errors.permissionIds.message}</p>}
              </div>

              {isLoadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="space-y-6 bg-slate-950 p-4 rounded-md border border-slate-800">
                  {groupedPermissions && Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-3">
                      <h4 className="text-sm font-semibold text-blue-400 border-b border-slate-800 pb-1">{resource}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {perms.map((permission: Permission) => (
                          <label key={permission.id} className="flex items-start gap-3 cursor-pointer group">
                            <Controller
                              name="permissionIds"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  value={permission.id}
                                  checked={field.value.includes(permission.id)}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    const updatedValue = e.target.checked
                                      ? [...field.value, value]
                                      : field.value.filter((id: number) => id !== value);
                                    field.onChange(updatedValue);
                                  }}
                                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                                />
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400 transition-colors">
                                {permission.name}
                              </span>
                            </div>
                          </label>
                        ))}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold" 
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Cargo'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar novo cargo?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Você começou a preencher os dados deste cargo. Deseja realmente descartar as informações e perder a seleção de permissões?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-800 pt-4">
            <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">
              Continuar preenchendo
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { setOpen(false); reset(); }} 
              className="bg-red-600 text-white hover:bg-red-700 font-bold"
            >
              Descartar e Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}