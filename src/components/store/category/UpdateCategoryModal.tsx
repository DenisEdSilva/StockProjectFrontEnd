'use client'

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/store/categoryService';
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface UpdateCategoryModalProps {
  storeId: number
  category: { 
    id: number; 
    name: string
  }
}

export function UpdateCategoryModal({ category, storeId }: UpdateCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category.name
      });
    }
  }, [open, category, reset]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const values = getValues();
      const isDirty = values.name !== category.name;

      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
      reset({ name: category.name });
    }
    setOpen(isOpen);
  }

  const { mutateAsync: updateCategoryFn, isPending } = useMutation({
    mutationFn: (data: CategoryFormData) => categoryService.updateCategory(storeId, category.id, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      setOpen(false);
    }
  });

  async function handleUpdateCategory(data: CategoryFormData) {
    try {
      await updateCategoryFn(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || 'Falha na atualização da categoria.');
      } else {
        alert('Ocorreu um erro inesperado');
      }
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
            <DialogTitle>Editar Categoria: {category.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleUpdateCategory)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Categoria</label>
              <Input 
                {...register('name')} 
                placeholder="Ex: Bebidas, Sobremesas..." 
                className="bg-background border-border focus-visible:ring-primary"
              />
              {errors.name && <p className="text-xs text-primary">{errors.name.message}</p>}
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
              Você começou a editar o nome desta categoria. Deseja realmente descartar as informações?
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