"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserCircle, FolderKanban,
  PackageSearch, CheckSquare, BarChart3, Settings,
  Boxes, BookOpen, ChevronRight, LogOut, LayoutTemplate, Wallet, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { getInitials } from "@/lib/utils-crm";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: React.ElementType; minRole?: Role };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",   label: "Dashboard",     icon: LayoutDashboard },
  { href: "/pauta",       label: "Pauta",          icon: CalendarDays },
  { href: "/crm",         label: "CRM / Pipeline", icon: UserCircle },
  { href: "/clientes",    label: "Clientes",       icon: Users },
  { href: "/projetos",    label: "Projetos",       icon: FolderKanban },
  { href: "/templates",   label: "Templates",      icon: LayoutTemplate,  minRole: "leader" },
  { href: "/produtos",    label: "Produtos",       icon: Boxes,           minRole: "leader" },
  { href: "/tarefas",     label: "Tarefas",        icon: CheckSquare },
  { href: "/equipe",      label: "Equipe",         icon: PackageSearch,   minRole: "leader" },
  { href: "/financeiro",  label: "Financeiro",     icon: Wallet,          minRole: "admin" },
  { href: "/relatorios",  label: "Relatórios",     icon: BarChart3,       minRole: "leader" },
];

const ROLE_RANK: Record<Role, number> = { admin: 3, leader: 2, collaborator: 1 };
function canAccess(userRole: Role, minRole?: Role) {
  if (!minRole) return true;
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

const BOTTOM_ITEMS = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/docs-api", label: "Docs & API", icon: BookOpen },
];

export function CRMSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-black flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="font-black text-black text-sm">V</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">TDL Hub</p>
            <p className="text-white/40 text-xs mt-0.5">CRM Geral</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
        {NAV_ITEMS.filter(({ minRole }) => canAccess((currentUser?.role as Role) ?? "collaborator", minRole)).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-yellow-400 text-black"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-white/10 pt-3">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-yellow-400 text-black"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* User */}
        {currentUser && (
          <div className="mt-3 px-3 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-black">{getInitials(currentUser.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{currentUser.name}</p>
              <p className="text-white/40 text-xs capitalize">{currentUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/10"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
