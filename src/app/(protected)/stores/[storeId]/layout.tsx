'use client'

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { storeService } from '@/services/owner/storeService';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/store/AppSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const storeId = Number(params.storeId);

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['active-store', storeId],
    queryFn: () => storeService.getStoreById(storeId),
    enabled: !!storeId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
  useEffect(() => {
    if (error) {
      router.push('/owner/select-store');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-950">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="h-4 w-px bg-slate-800" />
                <h2 className="text-sm font-medium text-slate-200 truncate">
                  {store?.name} <span className="text-slate-500 mx-2">•</span> 
                  <span className="text-slate-400 font-normal">{store?.city}</span>
                </h2>
              </div>
            </header>

            <div className="p-6 md:p-8 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}