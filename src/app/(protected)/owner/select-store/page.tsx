'use client'

import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/owner/storeService';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/contexts/AuthContext';
import { CreateStoreModal } from '@/components/owner/CreateStoreModal';
import { UpdateStoreModal } from '@/components/owner/UpdateStoreModal';
import { DeleteStoreModal } from '@/components/owner/DeleteStoreModal';

export default function SelectStorePage() {
  const { user } = useContext(AuthContext)
  const router = useRouter();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['my-stores'],
    queryFn: storeService.listMyStores,
    enabled: !!user,
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Minhas Lojas</h1>
            <p className="text-slate-400 text-lg">Selecione uma unidade para gerenciar o estoque.</p>
          </div>
          <CreateStoreModal />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => (
            <div 
              key={store.id}
              className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                  <LayoutGrid className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <UpdateStoreModal store={store} />
                  <DeleteStoreModal storeId={store.id} storeName={store.name} />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-1">{store.name}</h3>
              <p className="text-slate-500 text-sm mb-6">ID: #{store.id}</p>

              <Button 
                onClick={() => router.push(`/stores/${store.id}/dashboard`)}
                className="w-full bg-slate-800 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all gap-2"
              >
                Acessar Unidade
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}