'use client'

import { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeSchema, StoreFormData } from '@/lib/validations/store';
import { storeService } from '@/services/owner/storeService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";

interface UpdateStoreModalProps {
  store: {
    id: number;
    name: string;
    zipCode: string;
    state: string;
    city: string;
  }
}

export function UpdateStoreModal({ store }: UpdateStoreModalProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const queryClient = useQueryClient();

  const formatCEP = (value: string) => {
    if (!value) return "";
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue, getValues, control } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store.name,
      zipCode: formatCEP(store.zipCode),
      state: store.state,
      city: store.city
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        ...store,
        zipCode: formatCEP(store.zipCode)
      });
    }
  }, [open, store, reset]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const values = getValues();

      const currentZipClean = values.zipCode.replace(/\D/g, "");
      const originalZipClean = store.zipCode.replace(/\D/g, "");

      const isDirty = values.name !== store.name || 
                      currentZipClean !== originalZipClean ||
                      values.city !== store.city ||
                      values.state !== store.state;

      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
        reset({
          ...store,
          zipCode: formatCEP(store.zipCode)
        });
    }
    setOpen(isOpen);
  }

  const { mutateAsync: updateStoreFn, isPending } = useMutation({
    mutationFn: (data: StoreFormData) => storeService.updateStore(store.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stores'] });
      setOpen(false);
    }
  });

  const zipCodeValue = useWatch({ control, name: "zipCode" });

  const handleFetchAddress = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue("city", data.localidade);
          setValue("state", data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (zipCodeValue) handleFetchAddress(zipCodeValue);
  }, [zipCodeValue, handleFetchAddress]);

  async function handleUpdateStore(data: StoreFormData) {
    try {
      await updateStoreFn(data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            alert(error.message || 'Falha na atualização da loja.');
        } else {
            alert('Ocorreu um erro inesperado');
        }
      alert("Erro ao atualizar loja");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-500 hover:bg-amber-500/10">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25 bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar Unidade: {store.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleUpdateStore)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Loja</label>
              <Input {...register('name')} placeholder="Ex: Filial Centro" />
              {errors.name && <p className="text-xs text-primary">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CEP</label>
                <Input 
                  {...register('zipCode')} 
                  placeholder="00000-000"
                  maxLength={9}
                  className="bg-background border-border focus-visible:ring-primary"
                  onChange={(e) => {
                    const { value } = e.target;
                    e.target.value = formatCEP(value);
                    register('zipCode').onChange(e)
                  }}
                />
                {errors.zipCode && <span className="text-xs text-primary font-medium">{errors.zipCode.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input {...register('state')} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input {...register('city')} disabled />
            </div>

            <Button type="submit" className="w-full mt-4 bg-primary text-primary-foreground hover:opacity-85" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você começou a preencher os dados desta unidade. Deseja realmente descartar as informações?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 p-6 rounded-t-none rounded-br-none border-none bg-slate-800 hover:bg-slate-700">
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="flex-1 p-6 rounded-t-none rounded-bl-none border-none bg-primary text-primary-foreground hover:opacity-85"
            >
              Descartar e Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}