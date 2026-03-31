"use client";
import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Users, FolderKanban,
  CheckSquare, AlertCircle, Clock, BarChart3, ArrowUpRight, Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients, useProjects, useTasks, useUsers, useFinancialEntries } from "@/hooks/use-data";
import { getInitials } from "@/lib/utils-crm";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[3px_3px_0px_#000] flex items-start gap-4">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-black", color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{value}</p>
        <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { users } = useUsers();
  const { entries } = useFinancialEntries();

  // ── Financeiro ────────────────────────────────────────────────────────────
  const mrr = useMemo(() =>
    entries.filter((e) => e.type === "receita" && e.category === "mrr" && e.status === "pago")
      .reduce((s, e) => s + e.amount, 0), [entries]);
  const receitaTotal = useMemo(() =>
    entries.filter((e) => e.type === "receita" && e.status === "pago").reduce((s, e) => s + e.amount, 0), [entries]);
  const despesaTotal = useMemo(() =>
    entries.filter((e) => e.type === "despesa" && e.status === "pago").reduce((s, e) => s + e.amount, 0), [entries]);
  const resultado = receitaTotal - despesaTotal;
  const inadimplentes = useMemo(() =>
    entries.filter((e) => e.status === "atrasado"), [entries]);

  // ── Projetos ──────────────────────────────────────────────────────────────
  const projetosAtivos = projects.filter((p) => p.status !== "concluido" && p.status !== "cancelado");
  const projetosConcluidos = projects.filter((p) => p.status === "concluido");

  // ── Tarefas ───────────────────────────────────────────────────────────────
  const tarefasAtrasadas = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.filter((t) => t.status !== "concluida" && t.dueDate && new Date(t.dueDate) < today);
  }, [tasks]);
  const tarefasPendentes = tasks.filter((t) => t.status === "a_fazer" || t.status === "em_andamento");

  // ── Equipe ────────────────────────────────────────────────────────────────
  const membrosAtivos = users.filter((u) => u.active);
  const workload = useMemo(() =>
    membrosAtivos.map((u) => {
      const open = tasks.filter((t) => t.assigneeId === u.id && t.status !== "concluida");
      const hours = open.reduce((s, t) => s + ((t as typeof t & { estimatedHours?: number }).estimatedHours ?? 1), 0);
      const capacity = (u as typeof u & { dailyCapacity?: number }).dailyCapacity ?? 8;
      return { user: u, hours, capacity, pct: Math.min(Math.round((hours / capacity) * 100), 100) };
    }).sort((a, b) => b.pct - a.pct), [membrosAtivos, tasks]);

  // ── Clientes recentes ─────────────────────────────────────────────────────
  const clientesRecentes = [...clients].sort((a, b) =>
    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Visão Geral — Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Controle total da operação, financeiro e equipe</p>
      </div>

      {/* KPIs Financeiros */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Financeiro</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="MRR" value={fmt(mrr)} sub="receita recorrente" icon={<DollarSign size={18} />} color="bg-yellow-400" />
          <KPI label="Receita Total" value={fmt(receitaTotal)} sub="entradas pagas" icon={<TrendingUp size={18} />} color="bg-green-400" />
          <KPI label="Despesas" value={fmt(despesaTotal)} sub="saídas pagas" icon={<TrendingDown size={18} />} color="bg-red-300" />
          <KPI
            label="Resultado"
            value={fmt(resultado)}
            sub={resultado >= 0 ? "superávit" : "déficit"}
            icon={<BarChart3 size={18} />}
            color={resultado >= 0 ? "bg-emerald-400" : "bg-red-400"}
          />
        </div>
      </div>

      {/* KPIs Operacionais */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Operacional</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Clientes Ativos" value={String(clients.filter((c) => c.status === "ativo").length)} sub={`${clients.length} total`} icon={<Users size={18} />} color="bg-blue-300" />
          <KPI label="Projetos Ativos" value={String(projetosAtivos.length)} sub={`${projetosConcluidos.length} concluídos`} icon={<FolderKanban size={18} />} color="bg-purple-300" />
          <KPI label="Tarefas Abertas" value={String(tarefasPendentes.length)} sub={`${tarefasAtrasadas.length} atrasadas`} icon={<CheckSquare size={18} />} color="bg-orange-300" />
          <KPI label="Inadimplência" value={String(inadimplentes.length)} sub={`${fmt(inadimplentes.reduce((s, e) => s + e.amount, 0))} em atraso`} icon={<AlertCircle size={18} />} color="bg-red-200" />
        </div>
      </div>

      {/* Workload + Clientes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Workload da equipe */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
          <div className="px-5 py-3 bg-black flex items-center gap-2">
            <Gauge size={14} className="text-yellow-400" />
            <span className="text-sm font-black text-yellow-400">Workload da Equipe</span>
          </div>
          <div className="divide-y divide-gray-100">
            {workload.slice(0, 6).map(({ user, hours, capacity, pct }) => {
              const bar = pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-yellow-400" : "bg-green-400";
              return (
                <div key={user.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-yellow-400">{getInitials(user.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{user.name}</span>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{hours.toFixed(1)}h / {capacity}h</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {workload.length === 0 && <p className="px-5 py-6 text-xs text-gray-400 text-center">Nenhum membro na equipe</p>}
          </div>
        </div>

        {/* Clientes recentes */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-gray-100 flex items-center justify-between">
            <span className="text-sm font-black">Clientes Recentes</span>
            <a href="/clientes" className="flex items-center gap-1 text-xs text-yellow-600 font-bold hover:underline">
              Ver todos <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {clientesRecentes.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-gray-600">{getInitials(c.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.segment ?? "—"}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0",
                  c.status === "ativo" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"
                )}>
                  {c.status === "ativo" ? "Ativo" : c.status ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarefas atrasadas */}
      {tarefasAtrasadas.length > 0 && (
        <div className="bg-white border-2 border-red-400 rounded-xl shadow-[3px_3px_0px_#f87171] overflow-hidden">
          <div className="px-5 py-3 bg-red-50 border-b-2 border-red-200 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-sm font-black text-red-700">{tarefasAtrasadas.length} Tarefa(s) Atrasada(s)</span>
          </div>
          <div className="divide-y divide-red-50">
            {tarefasAtrasadas.slice(0, 5).map((t) => {
              const assignee = users.find((u) => u.id === t.assigneeId);
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <Clock size={12} className="text-red-400 flex-shrink-0" />
                  <p className="flex-1 text-xs font-semibold text-gray-900 truncate">{t.title}</p>
                  {assignee && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{assignee.name}</span>
                  )}
                  <span className="text-[10px] text-red-500 font-bold flex-shrink-0">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
