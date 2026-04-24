'use client'

import { 
  Package, Tags, History, Users, 
  ShieldCheck, LayoutDashboard,  
  ScrollText, Store
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
import { useCan } from "@/hooks/useCan"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"

export function AppSidebar() {
  const { canView } = useCan()
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

      <SidebarFooter className="bg-slate-900 border-t border-slate-800 p-2">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Voltar para Lojas">
                <Link href="/owner/select-store" className="text-slate-400 hover:text-white">
                  <Store className="w-4 h-4" />
                  <span>Minhas Lojas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}