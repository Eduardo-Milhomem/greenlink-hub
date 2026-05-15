import {
  LayoutDashboard,
  Users,
  UserPlus,
  Kanban,
  FileText,
  ShoppingCart,
  Package,
  FileSignature,
  Wrench,
  Boxes,
  Wallet,
  LifeBuoy,
  Settings,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; url: string; icon: LucideIcon; soon?: boolean };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Visão geral",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Comercial",
    items: [
      { title: "Leads", url: "/leads", icon: UserPlus },
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Pipeline", url: "/pipeline", icon: Kanban },
      { title: "Orçamentos", url: "/orcamentos", icon: FileText },
      { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
      { title: "Catálogo", url: "/catalogo", icon: Package },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Contratos", url: "/contratos", icon: FileSignature },
      { title: "Ordens de Serviço", url: "/os", icon: Wrench },
      { title: "Ativos", url: "/ativos", icon: Cpu },
      { title: "Estoque", url: "/estoque", icon: Boxes },
    ],
  },
  {
    label: "Financeiro & Suporte",
    items: [
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
      { title: "Suporte", url: "/suporte", icon: LifeBuoy },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Configurações", url: "/configuracoes", icon: Settings },
      { title: "Usuários", url: "/admin/usuarios", icon: Users },
    ],
  },
];

export const bottomNav: NavItem[] = [
  { title: "Início", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "OS", url: "/os", icon: Wrench },
  { title: "Financeiro", url: "/financeiro", icon: Wallet },
];
