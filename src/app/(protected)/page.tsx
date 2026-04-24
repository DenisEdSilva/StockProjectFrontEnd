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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
    return !log.action.includes('_LIST')
  })

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

        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-queries" 
              checked={showQueries} 
              onCheckedChange={setShowQueries}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="show-queries" className="text-xs font-medium text-slate-300 cursor-pointer flex items-center gap-1.5">
              {showQueries ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
              Exibir consultas (_LIST)
            </Label>
          </div>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4 w-16 text-center">Nível</th>
              <th className="px-6 py-4">Responsável / Ação</th>
              <th className="px-6 py-4">Evento</th>
              <th className="px-6 py-4 w-12 text-center">Dados</th>
              <th className="px-6 py-4 text-right">Horário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-amber-500 w-8 h-8" />
                  <p className="mt-2 text-xs text-slate-500 uppercase font-bold tracking-widest">Carregando registros...</p>
                </td>
              </tr>
            ) : filteredLogs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-500 italic text-sm">
                  Nenhuma atividade relevante encontrada.
                </td>
              </tr>
            ) : filteredLogs?.map((log) => {
              const isQuery = log.action.includes('_LIST')
              
              return (
                <tr 
                  key={log.id} 
                  className={`
                    group transition-colors duration-150
                    ${isQuery ? 'bg-slate-950/20 opacity-70' : 'hover:bg-slate-800/30'}
                  `}
                >
                  <td className="px-6 py-5 text-center w-16">
                    {log.isOwner ? (
                    <UserCheck className="w-5 h-5 text-amber-500 mx-auto" />
                    ) : (
                    <ShieldAlert className="w-5 h-5 text-slate-600 mx-auto" />
                    )}
                </td>


                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-100 font-bold text-sm tracking-tight group-hover:text-amber-400 transition-colors">
                        {log.userName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold">
                        {log.actionLabel}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className={`
                      text-sm leading-relaxed
                      ${isQuery ? 'text-slate-500 italic' : 'text-slate-200 font-medium'}
                    `}>
                      {log.description}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
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
                              <span className="text-blue-500 font-bold uppercase tracking-tighter">IP:</span>
                              <code className="text-slate-300">{log.ipAddress}</code>
                            </div>
                            <div className="flex flex-col border-t border-slate-800 pt-2">
                              <span className="text-blue-500 font-bold uppercase tracking-tighter mb-1">Navegador:</span>
                              <span className="text-slate-500 break-all leading-tight max-w-50">
                                {log.userAgent}
                              </span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1 text-slate-100 font-bold text-xs">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        {format(new Date(log.createdAt), "dd MMM", { locale: ptBR })}
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50">
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