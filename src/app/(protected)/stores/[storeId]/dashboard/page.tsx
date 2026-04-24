'use client'

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { storeService } from '@/services/owner/storeService';
import { Package, Tags, Users, ArrowUpRight } from 'lucide-react';

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = Number(params.storeId);

  const { data: store } = useQuery({
    queryKey: ['active-store', storeId],
    queryFn: () => storeService.getStoreById(storeId),
  });

  const metrics = [
    {
      label: 'Produtos Cadastrados',
      value: store?._count?.products || 0,
      icon: Package,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Categorias Ativas',
      value: store?._count?.categories || 0,
      icon: Tags,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Usuários da Loja',
      value: store?._count?.storeUsers || 0,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Visão Geral</h2>
        <p className="text-slate-400">Resumo operacional da unidade {store?.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((item) => (
          <div 
            key={item.label}
            className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-slate-400 font-medium">{item.label}</p>
              <h3 className="text-3xl font-bold">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="h-64 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
           Gráfico de Movimentações (Em breve)
         </div>
         <div className="h-64 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600">
           Últimas Atividades (Em breve)
         </div>
      </div>
    </div>
  );
}