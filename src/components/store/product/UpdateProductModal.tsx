'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/store/productService'
import { categoryService } from '@/services/store/categoryService'
import { useCan } from '@/hooks/useCan'
import { isAxiosError } from 'axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Product } from '@/types/product'

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

type ProductFormData = z.infer<typeof productSchema>

interface UpdateProductModalProps {
  storeId: number
  product: Product
}

export function UpdateProductModal({ product, storeId }: UpdateProductModalProps) {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const queryClient = useQueryClient();
  
  const { hasPermission } = useCan()
  const canEditCatalog = hasPermission('PUT', 'CATALOG')

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => categoryService.listCategory(storeId),
    enabled: open
  })

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      price: formatToBRL(product.price),
      categoryId: product.categoryId || product.category?.id || 0,
      description: product.description || '',
      banner: product.banner || '',
      sku: product.sku || ''
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        name: product.name,
        price: formatToBRL(product.price),
        categoryId: product.categoryId || product.category?.id || 0,
        description: product.description || '',
        banner: product.banner || '',
        sku: product.sku || ''
      })
    }
  }, [open, product, reset])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const values = getValues();
      const isDirty = 
        values.name !== product.name || 
        values.price !== String(product.price) || 
        (values.sku || '') !== (product.sku || '') ||
        values.categoryId !== (product.categoryId || product.category?.id);

      if (isDirty) {
        setShowConfirmClose(true);
        return;
      }
    }
    setOpen(isOpen);
  }

  const { mutateAsync: updateProductFn, isPending } = useMutation({
    mutationFn: (data: Partial<ProductFormData>) => productService.updateProduct(storeId, product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
      setOpen(false)
    }
  })

  async function handleUpdateProduct(formData: ProductFormData) {
    const payload: Partial<ProductFormData> = {};

    if (formData.price !== String(product.price)) {
      payload.price = formData.price;
    }

    if (canEditCatalog) {
      if (formData.name !== product.name) payload.name = formData.name;
      if ((formData.sku || '') !== (product.sku || '')) payload.sku = formData.sku;
      if ((formData.description || '') !== (product.description || '')) payload.description = formData.description;
      if (formData.categoryId !== (product.categoryId || product.category?.id)) payload.categoryId = formData.categoryId;
    }

    if (Object.keys(payload).length === 0) {
      setOpen(false);
      return;
    }

    try {
      await updateProductFn(payload);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erro ao atualizar';
        if (error.response?.status === 403) {
          alert("Acesso Negado: Você não tem permissão para alterar dados globais (Nome/SKU).");
        } else if (error.response?.status === 409) {
          alert("Conflito: Este SKU já está sendo usado por outro produto.");
        } else {
          alert(message);
        }
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-125 bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Editar Produto</DialogTitle>
            {!canEditCatalog && (
              <div className="flex items-center gap-2 p-2 mt-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-medium uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Edição restrita: Apenas o preço pode ser alterado nesta unidade.
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(handleUpdateProduct)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Nome do Produto</label>
                <Input 
                  {...register('name')} 
                  disabled={!canEditCatalog}
                  className="bg-slate-950 border-slate-800 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">SKU / Referência</label>
                <Input 
                  {...register('sku')} 
                  disabled={!canEditCatalog}
                  className="bg-slate-950 border-slate-800 font-mono text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-amber-500/80 tracking-widest">Preço de Venda (R$)</label>
                <Input 
                  {...register('price', {
                    onChange: applyCurrencyMask
                  })} 
                  placeholder="0.00"
                  className="bg-slate-950 border-slate-800 focus:border-amber-500 font-bold text-amber-400" 
                  
                />
                {errors.price && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.price.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Categoria</label>
              <div className="relative">
                <select 
                  {...register('categoryId', { 
                    valueAsNumber: true,
                    onBlur: () => setCatOpen(false) 
                  })}
                  disabled={!canEditCatalog}
                  onClick={() => setCatOpen(!catOpen)}
                  onChange={(e) => {
                    register('categoryId', { valueAsNumber: true }).onChange(e);
                    setCatOpen(false);
                  }}
                  className="w-full h-10 pl-3 pr-10 appearance-none rounded-md bg-slate-950 border border-slate-800 text-sm outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>Selecione uma categoria...</option>
                  {categories?.data.map((cat: { id: number; name: string }) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
                  !canEditCatalog ? 'text-slate-600 opacity-50' : 'text-slate-500'
                }`}>
                  {catOpen && canEditCatalog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Descrição</label>
              <Input 
                {...register('description')} 
                disabled={!canEditCatalog}
                className="bg-slate-950 border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-2 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold transition-all" 
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Existem modificações não guardadas. Se sair agora, perderá o que editou.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-800 pt-4">
            <AlertDialogCancel className="bg-slate-800 text-slate-300 border-none hover:bg-slate-700">
              Continuar a editar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { setOpen(false); reset(); }}
              className="bg-red-600 text-white hover:bg-red-700 font-bold"
            >
              Sair sem guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}