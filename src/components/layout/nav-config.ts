import {
  LayoutDashboard, Users, UserPlus, Kanban, FileText, ShoppingCart, Package,
  FileSignature, Wrench, Boxes, Wallet, LifeBuoy, Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: any;
  soon?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

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
    label: "Operação (em breve)",
    items: [
      { title: "Contratos", url: "#", icon: FileSignature, soon: true },
      { title: "Ordens de Serviço", url: "#", icon: Wrench, soon: true },
      { title: "Estoque", url: "#", icon: Boxes, soon: true },
      { title: "Financeiro", url: "#", icon: Wallet, soon: true },
      { title: "Suporte", url: "#", icon: LifeBuoy, soon: true },
    ],
  },
  {
    label: "Sistema",
    items: [{ title: "Configurações", url: "/configuracoes", icon: Settings }],
  },
];

export const bottomNav: NavItem[] = [
  { title: "Início", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
];
