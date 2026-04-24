'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { auditLogService } from '@/services/store/auditLogService'
import { 
  Loader2, UserCheck, ShieldAlert, Activity, Info, 
  Eye, EyeOff, Calendar 
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function AuditLogsPage() {
  const { storeId, page } = useParams()
  const id = Number(storeId)
  const actualPage = Number(page)
  
  const [showQueries, setShowQueries] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', id],
    queryFn: () => auditLogService.auditLogList(id, actualPage),
    enabled: !!id,
  })

  const filteredLogs = data?.data.filter(log => {
    if (showQueries) return true
    return !log.action?.includes('_LIST')
  }) || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" />
            Auditoria do Sistema
          </h1>
          <p className="text-slate-400 text-sm">Histórico detalhado de ações e acessos da unidade.</p>
        </div>

        <button
          onClick={() => setShowQueries(!showQueries)}
          className={`
            flex max-w-40 items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all duration-200
            ${showQueries 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            }
          `}
        >
          <div className="flex gap-2 items-center justify-center">
            <p className="w-24">{showQueries ? 'Ocultar Consultas' : 'Exibir Consultas'}</p>
          </div>
          {showQueries ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
          
        </button>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-3 py-4 w-[7.5%] text-center">Nível</th>
              <th className="px-3 py-4 w-[20%]">Ação</th>
              <th className="px-3 py-4 w-[50%]">Evento</th>
              <th className="px-3 py-4 w-[10%]">Responsável</th>
              <th className="px-3 py-4 w-[7.5%] text-center">Dados</th>
              <th className="px-3 py-4 w-[10%]">Horário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-amber-500 w-8 h-8" />
                  <p className="mt-2 text-xs text-slate-500 uppercase font-bold tracking-widest">Carregando registros...</p>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-500 italic text-sm">
                  Nenhuma atividade relevante encontrada.
                </td>
              </tr>
            ) : filteredLogs.map((log) => {
              const isQuery = log.action?.includes('_LIST')
              
              return (
                <tr 
                  key={log.id} 
                  className={`
                    group transition-colors duration-150
                    ${isQuery ? 'bg-slate-950/20 opacity-70' : 'hover:bg-slate-800/30'}
                  `}
                >
                  <td className="p-2 text-center">
                    {log.isOwner ? (
                      <UserCheck className="w-5 h-5 text-amber-500 mx-auto" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-2 overflow-hidden">
                    <span className="text-slate-100 text-sm tracking-tight group-hover:text-amber-400 transition-colors truncate">
                      {log.actionLabel}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className={`
                      text-sm
                      ${isQuery ? 'text-slate-500 italic' : 'text-slate-200'}
                    `}>
                      {log.description}
                    </div>
                  </td>
                  <td className="p-2 overflow-hidden">
                    <span className="text-slate-100 text-sm tracking-tight group-hover:text-amber-400 transition-colors truncate">
                      {log.userName}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-slate-800 text-slate-700 hover:text-blue-400 transition-all">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-950 border-slate-800 p-3 shadow-2xl">
                          <div className="space-y-2 text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500 uppercase tracking-tighter">IP:</span>
                              <code className="text-slate-300">{log.ipAddress}</code>
                            </div>
                            <div className="flex flex-col border-t border-slate-800 pt-2">
                              <span className="text-blue-500 uppercase tracking-tighter mb-1">Navegador:</span>
                              <span className="text-slate-500 break-all leading-tight max-w-50">
                                {log.userAgent}
                              </span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex flex-row gap-2">
                      <div className="flex items-center gap-1 text-slate-100 text-xs">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        {format(new Date(log.createdAt), "dd MMM", { locale: ptBR })}
                      </div>
                      <span className="flex items-center gap-1 text-slate-100 text-xs">
                        {format(new Date(log.createdAt), "HH:mm:ss")}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}