'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { storeUserService } from '@/services/store/storeUserService'
import { roleService } from '@/services/store/roleService'
import { Permission } from '@/types/permission'
import { Role } from '@/types/role'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, UserPlus, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

const storeUserSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A palavra-passe deve ter no mínimo 6 caracteres"),
  roleId: z.number().min(1, "É obrigatório selecionar um Cargo Base"),
  permissionIds: z.array(z.number())
})

type StoreUserFormData = z.infer<typeof storeUserSchema>

interface CreateStoreUserModalProps {
  storeId: number
}

export function CreateStoreUserModal({ storeId }: CreateStoreUserModalProps) {
  const [open, setOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [isExceptionsOpen, setIsExceptionsOpen] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', storeId],
    queryFn: () => roleService.roleList(storeId, 1), 
    enabled: open
  })

  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.listAllPermissions(),
    enabled: open
  })

  const { register, handleSubmit, control, formState: { errors }, reset, getValues } = useForm<StoreUserFormData>({
    resolver: zodResolver(storeUserSchema),
    defaultValues: { name: '', email: '', password: '', roleId: 0, permissionIds: [] }
  })

  const selectedRoleId = useWatch({ control, name: 'roleId' })
  const currentSelectedPermissionIds = useWatch({ control, name: 'permissionIds' }) || []

  const groupedPermissions = useMemo(() => {
    if (!permissionsData || !rolesData) return null;

    const selectedRole = rolesData?.data.find((r: Role) => r.id === Number(selectedRoleId));
    const rolePermissionIds = selectedRole?.permissions?.map((p: Permission) => Number(p.id || p.id)) || [];

    return permissionsData
      .filter((curr: Permission) => curr.resource !== 'STORE')
      .reduce((acc: Record<string, Permission[]>, curr: Permission) => {
        if (rolePermissionIds.includes(Number(curr.id))) return acc;

        const group = curr.resource || 'OUTROS';
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
      }, {} as Record<string, Permission[]>);
  }, [permissionsData, rolesData, selectedRoleId]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setIsExceptionsOpen(false);
    
    if (!isOpen) {
      const values = getValues();
      const isDirty = values.name.trim() !== '' || values.email.trim() !== '' || values.permissionIds.length > 0 || values.roleId !== 0;
      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
      reset();
    }
    setOpen(isOpen);
  }

  const { mutateAsync: createUserFn, isPending } = useMutation({
    mutationFn: (data: StoreUserFormData) => storeUserService.createStoreUser(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] })
      setOpen(false)
      reset()
    }
  })

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold gap-2">
            <UserPlus className="w-4 h-4" /> Novo Membro
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-175 bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <UserPlus className="w-5 h-5 text-amber-500" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Adicionar Membro</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => createUserFn(data))} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nome Completo</label>
                <Input {...register('name')} placeholder="Ex: João Silva" className="bg-slate-950 border-slate-800 focus:border-amber-500" />
                {errors.name && <p className="text-[10px] text-red-500 uppercase">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">E-mail de Acesso</label>
                <Input {...register('email')} type="email" placeholder="joao@empresa.com" className="bg-slate-950 border-slate-800 focus:border-amber-500" />
                {errors.email && <p className="text-[10px] text-red-500 uppercase">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Palavra-passe</label>
                <Input {...register('password')} type="password" placeholder="*********" className="bg-slate-950 border-slate-800 focus:border-amber-500" />
                {errors.password && <p className="text-[10px] text-red-500 uppercase">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold uppercase text-amber-500 tracking-widest">Cargo Base</label>
                <div className="relative">
                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field }) => (
                      <select 
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={() => setRoleOpen(false)}
                        onClick={() => setRoleOpen(!roleOpen)}
                        className="w-full h-10 pl-3 pr-10 appearance-none rounded-md bg-slate-950 border border-slate-800 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value={0}>Selecione um cargo...</option>
                        {rolesData?.data.map((role: Role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    {roleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {errors.roleId && <p className="text-[10px] text-red-500 uppercase">{errors.roleId.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExceptionsOpen(!isExceptionsOpen)}
                className="w-full grid grid-cols-10 items-center gap-2 text-left group p-2 rounded-lg hover:bg-slate-800/30 transition-all"
              >
                <div className="col-span-9 flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase text-blue-400 tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Exceções de Acesso (OPCIONAL)
                    </h3>
                    {currentSelectedPermissionIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        {currentSelectedPermissionIds.length} Ativas
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Selecione permissões extras específicas que <span className="font-bold text-slate-200">NÃO</span> fazem parte do Cargo selecionado acima.
                  </p>
                </div>

                <div className="col-span-1 flex justify-end text-slate-400 group-hover:text-blue-400 transition-colors">
                  {isExceptionsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExceptionsOpen && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isLoadingPermissions ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                  ) : (
                    <div className="space-y-6 bg-slate-950/50 p-4 rounded-md border border-slate-800/80">
                      {groupedPermissions && Object.entries(groupedPermissions).map(([resource, perms]) => {
                        const selectedInGroup = perms.filter(p => currentSelectedPermissionIds.includes(p.id)).length;
                        return (
                          <div key={resource} className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800/50 pb-1 mb-3">
                              <h4 className="text-[11px] font-bold text-slate-500 uppercase">{resource}</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedInGroup > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/50 text-slate-500'}`}>
                                {selectedInGroup} / {perms.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {perms.map((permission: Permission) => (
                                <label key={permission.id} className="flex items-start gap-2 cursor-pointer group">
                                  <Controller
                                    name="permissionIds"
                                    control={control}
                                    render={({ field }) => (
                                      <input
                                        type="checkbox"
                                        checked={field.value.includes(permission.id)}
                                        onChange={(e) => {
                                          const updated = e.target.checked ? [...field.value, permission.id] : field.value.filter(id => id !== permission.id);
                                          field.onChange(updated);
                                        }}
                                        className="mt-0.5 w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                                      />
                                    )}
                                  />
                                  <span className="text-xs text-slate-300 group-hover:text-blue-400 transition-colors leading-tight">{permission.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-11 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold" disabled={isPending || isLoadingRoles}>
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Adicionar Membro'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar novo membro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja realmente descartar as informações?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-800 pt-4">
            <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">Continuar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setOpen(false); reset(); }} className="bg-red-600 text-white hover:bg-red-700 font-bold">Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}