'use client'

import { 
  Package, Tags, History, Users, 
  ShieldCheck, LayoutDashboard,  
  ScrollText, Store, LogOut
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCan } from "@/hooks/useCan"
import { useAuth } from "@/hooks/useAuth"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "../ui/button"

export function AppSidebar() {
  const { canView } = useCan()
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const { storeId } = useParams()

  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed'

  const navigation = {
    operational: [
      { title: "Dashboard", icon: LayoutDashboard, url: `/stores/${storeId}/dashboard`, visible: true },
      { title: "Estoque", icon: History, url: `/stores/${storeId}/stockMovements`, visible: canView('STOCK') },
      { title: "Produtos", icon: Package, url: `/stores/${storeId}/products`, visible: canView('INVENTORY') },
      { title: "Categorias", icon: Tags, url: `/stores/${storeId}/categories`, visible: canView('CATEGORY') },
    ],
    admin: [
      { title: "Equipe", icon: Users, url: `/stores/${storeId}/storeUsers`, visible: canView('STORE_USER') },
      { title: "Cargos", icon: ShieldCheck, url: `/stores/${storeId}/roles`, visible: canView('ROLE') },
      { title: "Logs", icon: ScrollText, url: `/stores/${storeId}/auditLogs`, visible: canView('AUDIT_LOG') },
    ]
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-800">
      <SidebarHeader className="bg-slate-900 border-b border-slate-800 p-4 group-data-[collapsible=icon]:p-4 transition-all">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center gap-2">
          <div 
            onClick={() => isCollapsed && toggleSidebar()}
            className={`
              flex items-center gap-3 px-2 transition-all
              ${isCollapsed ? 'cursor-pointer hover:opacity-80' : ''}
              group-data-[collapsible=icon]:px-0
            `}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
              S
            </div>
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-slate-100 text-sm">StockSystem</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight">PAINEL DA LOJA</span>
            </div>
          </div>
          <SidebarTrigger className="text-slate-400 hover:text-amber-500 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900 gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 px-4">Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.operational.map((item) => item.visible && (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-amber-500/10 data-[active=true]:text-amber-500 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 px-4">Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.admin.map((item) => item.visible && (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-amber-500/10 data-[active=true]:text-amber-500 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-slate-900 border-t border-slate-800 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="w-full bg-slate-950 border border-slate-800/60 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
            >
              <Link href={`/stores/${storeId}/profile`}>
                <Avatar className="h-8 w-8 rounded-md border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                  <AvatarFallback className="bg-slate-800 text-slate-300 group-hover:text-amber-500 text-xs font-bold rounded-md transition-colors">
                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-0.5 leading-none truncate group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-amber-500 transition-colors">
                    {user?.name || 'Carregando...'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                    {user?.type === 'OWNER' ? 'Administrador' : 'Funcionário'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2 mt-2 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:mt-4">
          
          {user?.type === 'OWNER' && (
            <Button
              asChild
              variant="ghost"
              className="flex-1 h-8 bg-slate-800/30 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
            >
              <Link href="/owner/select-store" title="Trocar de Loja">
                <Store className="w-4 h-4" />
                <span className="ml-2 text-[11px] font-medium group-data-[collapsible=icon]:hidden">Trocar Loja</span>
              </Link>
            </Button>
          )}

          <Button
            onClick={signOut}
            variant="ghost"
            className="flex-1 h-8 bg-slate-800/30 text-slate-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2 text-[11px] font-medium group-data-[collapsible=icon]:hidden">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}