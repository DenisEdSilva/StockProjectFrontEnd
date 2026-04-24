'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/owner/storeService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from 'react';

interface DeleteStoreModalProps {
  storeId: number;
  storeName: string;
}

export function DeleteStoreModal({ storeId, storeName }: DeleteStoreModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: deleteStoreFn, isPending } = useMutation({
    mutationFn: () => storeService.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-stores'] });
      setOpen(false);
    },
    onError: () => {
      alert("Erro ao excluir a unidade. Verifique se existem produtos vinculados.");
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Unidade?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você está prestes a excluir a loja <strong className="text-slate-100">{storeName}</strong>. 
              Esta ação é irreversível e removerá todos os dados vinculados a esta unidade.
            </AlertDialogDescription>
          </AlertDialogHeader>

        <AlertDialogFooter className="flex row gap-0 sm:space-x-0 border-t border-border">
          <AlertDialogCancel 
            className="flex-1 p-6 rounded-t-none rounded-br-none border-none bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              deleteStoreFn();
            }}
            disabled={isPending}
            className="flex-1 p-6 rounded-t-none rounded-bl-none border-none bg-red-600 text-white hover:bg-red-700 font-semibold"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}