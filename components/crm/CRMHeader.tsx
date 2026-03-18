"use client";
import { useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useNotifications, markNotificationRead, markAllNotificationsRead } from "@/hooks/use-data";
import { formatRelativeDate } from "@/lib/utils-crm";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/crm": "CRM / Pipeline",
  "/clientes": "Clientes",
  "/projetos": "Projetos",
  "/entregas": "Entregas",
  "/produtos": "Produtos",
  "/tarefas": "Tarefas",
  "/equipe": "Equipe",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
  "/docs-api": "Docs & API",
};

export function CRMHeader() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications } = useNotifications();
  const { currentUser } = useAuthStore();

  const title = PAGE_TITLES[pathname] ?? "Virgo Hub";
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="font-bold text-gray-900 text-lg">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar..."
          className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 w-56 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell size={18} className="text-gray-600" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-yellow-400 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900">Notificações</p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={() => markAllNotificationsRead(notifications)} className="text-xs text-yellow-600 hover:text-yellow-700 font-medium">
                    Marcar todas
                  </button>
                )}
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nenhuma notificação</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                    !n.read && "bg-yellow-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                      n.type === "success" && "bg-green-500",
                      n.type === "warning" && "bg-yellow-500",
                      n.type === "error" && "bg-red-500",
                      n.type === "info" && "bg-blue-500",
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User chip */}
      {currentUser && (
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-400">
              {currentUser.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">{currentUser.name.split(" ")[0]}</p>
            <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
          </div>
        </div>
      )}
    </header>
  );
}
