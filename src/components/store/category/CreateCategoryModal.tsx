'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/store/categoryService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(50, "Nome muito longo"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CreateCategoryModal({ storeId }: { storeId: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  });

  const { mutateAsync: createCategoryFn, isPending } = useMutation({
    mutationFn: (data: CategoryFormData) => categoryService.createCategory(storeId, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      setOpen(false);
      reset();
    }
  });

  async function handleCreate(data: CategoryFormData) {
    try {
      await createCategoryFn(data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            alert(error.message || 'Falha na criação da categoria.')
        } else {
            alert('Ocorreu um erro inesperado')
        }
      alert("Erro ao criar categoria");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 text-slate-950 hover:bg-amber-600 gap-2">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Cadastrar Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Categoria</label>
            <Input 
              {...register('name')} 
              placeholder="Ex: Bebidas, Salgados..." 
              className="bg-background border-border"
            />
            {errors.name && <p className="text-xs text-primary">{errors.name.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cadastro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}