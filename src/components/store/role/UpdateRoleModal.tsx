'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/services/store/roleService'
import { Permission } from '@/types/permission'
import { Role, RoleFormData } from '@/types/role'
import { isAxiosError } from 'axios'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Loader2, ShieldCheck } from "lucide-react"

const roleSchema = z.object({
  name: z.string().min(3, "O nome do cargo deve ter pelo menos 3 caracteres"),
  permissionIds: z.array(z.number()).min(1, "Selecione pelo menos uma permissão"),
})

interface UpdateRoleModalProps {
  storeId: number
  role: Role
}

export function UpdateRoleModal({ role, storeId }: UpdateRoleModalProps) {
    console.log("Permissões vindas da API:", role.permissions);
    const [open, setOpen] = useState(false)
    const [showConfirmClose, setShowConfirmClose] = useState(false)
    const queryClient = useQueryClient()

    const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
        queryKey: ['permissions'],
        queryFn: () => roleService.listAllPermissions(),
        enabled: open
    })

    const currentPermissionIds = useMemo(() => {
        return role.permissions?.map(p => p.id) || []
    }, [role.permissions])

    const { register, handleSubmit, control, formState: { errors }, reset, getValues } = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
        name: role.name,
        permissionIds: currentPermissionIds
        }
    })

    useEffect(() => {
        if (open) {
        reset({
            name: role.name,
            permissionIds: currentPermissionIds
        })
        }
    }, [open, role.name, currentPermissionIds, reset])

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
        const values = getValues();
        const isDirty = 
            values.name !== role.name || 
            JSON.stringify(values.permissionIds.sort()) !== JSON.stringify(currentPermissionIds.sort());

        if (isDirty) {
            setShowConfirmClose(true);
            return;
        }
        }
        setOpen(isOpen);
    }

    const { mutateAsync: updateRoleFn, isPending } = useMutation({
        mutationFn: (data: Partial<RoleFormData>) => roleService.updateRole(storeId, role.id, data),
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles', storeId] })
        setOpen(false)
        }
    })

    async function handleUpdateRole(data: RoleFormData) {
        const payload: Partial<RoleFormData> = {}
        if (data.name !== role.name) payload.name = data.name
        
        const hasPermissionsChanged = JSON.stringify(data.permissionIds.sort()) !== JSON.stringify(currentPermissionIds.sort());
        if (hasPermissionsChanged) payload.permissionIds = data.permissionIds

        if (Object.keys(payload).length === 0) {
        setOpen(false)
        return
        }

        try {
        await updateRoleFn(payload)
        } catch (error: unknown) {
        if (isAxiosError(error)) {
            alert(error.response?.data?.message || "Erro ao atualizar o cargo.");
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
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-150 bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">Editar Cargo</DialogTitle>
                </div>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleUpdateRole)} className="space-y-6 pt-4">
                <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nome do Cargo</label>
                <Input {...register('name')} className="bg-slate-950 border-slate-800 focus:border-blue-500" />
                {errors.name && <p className="text-[10px] text-red-500 uppercase">{errors.name.message}</p>}
                </div>

                <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Permissões Ativas</label>
                
                {isLoadingPermissions ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                ) : (
                    <div className="space-y-6 bg-slate-950 p-4 rounded-md border border-slate-800">
                    {groupedPermissions && Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource} className="space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter border-b border-slate-800/50 pb-1">{resource}</h4>
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
                                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                    />
                                )}
                                />
                                <span className="text-sm text-slate-300 group-hover:text-blue-400 transition-colors">{permission.name}</span>
                            </label>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>

                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold" disabled={isPending}>
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Alterações'}
                </Button>
            </form>
            </DialogContent>
        </Dialog>

        <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <AlertDialogHeader>
                <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                Existem modificações não salvas nas permissões deste cargo.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="border-t border-slate-800 pt-4">
                <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">Continuar editando</AlertDialogCancel>
                <AlertDialogAction onClick={() => { setOpen(false); reset(); }} className="bg-red-600 text-white hover:bg-red-700 font-bold">Descartar</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}