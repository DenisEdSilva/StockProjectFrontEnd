'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/store/productService';
import { categoryService } from '@/services/store/categoryService';
import { useCan } from '@/hooks/useCan';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Link2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { isAxiosError } from 'axios';

const formatToBRL = (value: string | number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const applyCurrencyMask = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value === '') value = '0';
  const numberValue = Number(value) / 100;
  e.target.value = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numberValue);
  return e;
};

const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  price: z.string()
    .min(1, "O preço é obrigatório")
    .transform(val => val.replace(/\./g, '').replace(',', '.')),
  description: z.string().optional(),
  categoryId: z.number().min(1, "Selecione uma categoria"),
  banner: z.string().optional(),
  sku: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductModalProps {
  storeId: number
}

export function CreateProductModal({ storeId }: CreateProductModalProps) {
  const [open, setOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const queryClient = useQueryClient()
  
  const { hasPermission } = useCan()
  const canCreateCatalog = hasPermission('POST', 'CATALOG')

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => categoryService.listCategory(storeId),
    enabled: open
  })

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', sku: '', price: '', categoryId: 0, description: '', banner: '' }
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const values = getValues();
      const isDirty = values.name !== '' || (values.sku && values.sku !== '') || formatToBRL(values.price) !== '';
      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
      reset();
    }
    setOpen(isOpen);
  }

  const { mutateAsync: createProductFn, isPending } = useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
      setOpen(false)
      reset()
    }
  })

  async function handleCreateProduct(data: ProductFormData) {
    try {
      await createProductFn(data);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          alert("Conflito: Este SKU já está registado no inventário desta loja.");
        } else if (error.response?.status === 403) {
          alert("Acesso Negado: Não tem permissão para esta ação.");
        } else {
          alert(error.response?.data?.message || 'Falha no registo do produto.');
        }
      } else {
        alert('Ocorreu um erro inesperado.');
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-amber-500 text-slate-950 hover:bg-amber-600 gap-2 font-bold">
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-125 bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Cadastrar Produto</DialogTitle>
            {!canCreateCatalog && (
              <div className="flex items-center gap-2 p-2 mt-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium uppercase tracking-wider">
                <Link2 className="w-3.5 h-3.5" />
                Dica: Preencha um SKU existente para importar o produto da Matriz.
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateProduct)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nome do Produto</label>
                <Input 
                  {...register('name')} 
                  placeholder="Ex: Burger Clássico" 
                  className="bg-slate-950 border-slate-800 focus:border-amber-500" 
                />
                {errors.name && <p className="text-[10px] text-red-500 uppercase">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">SKU (Ref)</label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger type="button" className="focus:outline-none">
                        <Info className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700 max-w-xs p-3">
                        <p className="text-xs leading-relaxed">
                          Identificador único do produto. Se deixado em branco, o sistema gerará um automaticamente no padrão <strong className="text-amber-400">CAT-NOME-HASH</strong>.<br/><br/>
                          Ex: Categoria <span className="text-slate-400">LANCHE</span> + Nome <span className="text-slate-400">HAMBURGUER</span> <br/>
                          = <strong className="text-amber-400">LAN-HAMB-A4PQ</strong>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input 
                  {...register('sku')} 
                  placeholder="Opcional" 
                  className="bg-slate-950 border-slate-800 focus:border-amber-500 font-mono uppercase" 
                />
                {errors.sku && <p className="text-[10px] text-red-500 uppercase">{errors.sku.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-amber-500/80 tracking-widest">Preço de Venda (R$)</label>
                <Input 
                  {...register('price', {
                    onChange: applyCurrencyMask
                  })} 
                  placeholder="0.00" 
                  type="text" 
                  className="bg-slate-950 border-slate-800 focus:border-amber-500 text-amber-400 font-bold" 
                />
                {errors.price && <p className="text-[10px] text-red-500 uppercase">{errors.price.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Categoria</label>
              <div className="relative">
                <select 
                  {...register('categoryId', { 
                    valueAsNumber: true,
                    onBlur: () => setCatOpen(false) 
                  })}
                  onClick={() => setCatOpen(!catOpen)}
                  onChange={(e) => {
                    register('categoryId', { valueAsNumber: true }).onChange(e);
                    setCatOpen(false);
                  }}
                  className="w-full h-10 pl-3 pr-10 appearance-none rounded-md bg-slate-950 border border-slate-800 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value={0}>Selecione uma categoria...</option>
                  {categories?.data.map((cat: { id: number; name: string }) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 transition-transform duration-200">
                  {catOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
              </div>
              {errors.categoryId && <p className="text-[10px] text-red-500 uppercase">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Descrição (Opcional)</label>
              <Input 
                {...register('description')} 
                placeholder="Breve descrição do item" 
                className="bg-slate-950 border-slate-800 focus:border-amber-500" 
              />
            </div>

            <Button type="submit" className="w-full mt-4 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cadastro'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar novo produto?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Você começou a preencher os dados deste produto. Deseja realmente descartar as informações?
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