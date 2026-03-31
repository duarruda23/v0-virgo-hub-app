"use client";
import { useMemo } from "react";
import { CheckSquare, Clock, FolderKanban, Users, AlertCircle, ArrowUpRight, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, useProjects, useUsers } from "@/hooks/use-data";
import { useAuthStore } from "@/lib/store";
import { getInitials } from "@/lib/utils-crm";

const PRIORITY_COLORS: Record<string, string> = {
  urgente: "bg-red-100 text-red-700 border-red-200",
  alta:    "bg-orange-100 text-orange-700 border-orange-200",
  media:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa:   "bg-gray-100 text-gray-600 border-gray-200",
};
const PRIORITY_LABELS: Record<string, string> = { urgente: "Urgente", alta: "Alta", media: "Média", baixa: "Baixa" };
const STATUS_LABELS: Record<string, string> = { a_fazer: "A Fazer", em_andamento: "Em Andamento", em_revisao: "Em Revisão", concluida: "Concluída" };

function KPI({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[3px_3px_0px_#000] flex items-start gap-4">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-black", color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function SectorLeaderDashboard() {
  const currentUser = useAuthStore((s) => s.user);
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { users } = useUsers();

  // Projetos onde este líder é manager
  const myProjects = useMemo(() =>
    projects.filter((p) => p.managerId === currentUser?.id || (p.teamIds ?? []).includes(currentUser?.id ?? "")),
    [projects, currentUser]);

  // Tarefas dos projetos do líder
  const myProjectIds = myProjects.map((p) => p.id);
  const projectTasks = useMemo(() =>
    tasks.filter((t) => t.projectId && myProjectIds.includes(t.projectId)), [tasks, myProjectIds]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const atrasadas = projectTasks.filter((t) => t.status !== "concluida" && t.dueDate && new Date(t.dueDate) < today);
  const abertas   = projectTasks.filter((t) => t.status !== "concluida");
  const urgentes  = projectTasks.filter((t) => t.priority === "urgente" && t.status !== "concluida");

  // Minha equipe (usuários com tarefas nesses projetos)
  const teamIds = [...new Set(projectTasks.map((t) => t.assigneeId).filter(Boolean) as string[])];
  const team = users.filter((u) => teamIds.includes(u.id));

  // Workload da equipe
  const workload = useMemo(() =>
    team.map((u) => {
      const open = projectTasks.filter((t) => t.assigneeId === u.id && t.status !== "concluida");
      const hours = open.reduce((s, t) => s + ((t as typeof t & { estimatedHours?: number }).estimatedHours ?? 1), 0);
      const capacity = (u as typeof u & { dailyCapacity?: number }).dailyCapacity ?? 8;
      return { user: u, open: open.length, hours, capacity, pct: Math.min(Math.round((hours / capacity) * 100), 100) };
    }).sort((a, b) => b.pct - a.pct), [team, projectTasks]);

  // Próximas entregas
  const upcoming = projectTasks
    .filter((t) => t.status !== "concluida" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard — Líder de Setor</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhamento dos projetos e equipe sob sua gestão</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Projetos" value={String(myProjects.length)} sub={`${myProjects.filter((p) => p.status === "em_andamento").length} em andamento`} icon={<FolderKanban size={18} />} color="bg-yellow-400" />
        <KPI label="Tarefas Abertas" value={String(abertas.length)} sub={`${urgentes.length} urgentes`} icon={<CheckSquare size={18} />} color="bg-orange-300" />
        <KPI label="Atrasadas" value={String(atrasadas.length)} sub="precisam de atenção" icon={<AlertCircle size={18} />} color="bg-red-300" />
        <KPI label="Equipe" value={String(team.length)} sub="colaboradores ativos" icon={<Users size={18} />} color="bg-blue-300" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximas entregas */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-gray-100 flex items-center justify-between">
            <span className="text-sm font-black">Próximas Entregas</span>
            <a href="/tarefas" className="flex items-center gap-1 text-xs text-yellow-600 font-bold hover:underline">
              Ver todas <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {upcoming.map((t) => {
              const isLate = new Date(t.dueDate!) < today;
              const assignee = users.find((u) => u.id === t.assigneeId);
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={9} className={isLate ? "text-red-400" : "text-gray-400"} />
                      <span className={cn("text-[10px]", isLate ? "text-red-500 font-bold" : "text-gray-400")}>
                        {new Date(t.dueDate!).toLocaleDateString("pt-BR")}
                      </span>
                      {assignee && <span className="text-[10px] text-gray-400">· {assignee.name}</span>}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0", PRIORITY_COLORS[t.priority])}>
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </div>
              );
            })}
            {upcoming.length === 0 && <p className="px-5 py-8 text-xs text-gray-400 text-center">Nenhuma entrega pendente</p>}
          </div>
        </div>

        {/* Workload */}
        <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
          <div className="px-5 py-3 bg-black flex items-center gap-2">
            <Gauge size={14} className="text-yellow-400" />
            <span className="text-sm font-black text-yellow-400">Capacidade da Equipe</span>
          </div>
          <div className="divide-y divide-gray-100">
            {workload.map(({ user, open, hours, capacity, pct }) => {
              const bar = pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-yellow-400" : "bg-green-400";
              const badge = pct >= 90 ? "bg-red-100 text-red-700" : pct >= 65 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700";
              return (
                <div key={user.id} className="px-5 py-3">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-black text-yellow-400">{getInitials(user.name)}</span>
                    </div>
                    <span className="flex-1 text-xs font-bold text-gray-900 truncate">{user.name}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badge)}>{pct}%</span>
                    <span className="text-[10px] text-gray-400">{open} tarefas</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-10">
                    <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 ml-10 mt-1">{hours.toFixed(1)}h estimadas / {capacity}h disponíveis</p>
                </div>
              );
            })}
            {workload.length === 0 && <p className="px-5 py-8 text-xs text-gray-400 text-center">Nenhum colaborador encontrado</p>}
          </div>
        </div>
      </div>

      {/* Projetos */}
      <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-gray-100">
          <span className="text-sm font-black">Meus Projetos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Projeto</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Tarefas</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myProjects.map((p) => {
                const pTasks = tasks.filter((t) => t.projectId === p.id);
                const done = pTasks.filter((t) => t.status === "concluida").length;
                const progress = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-900 text-xs">{p.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        p.status === "em_andamento" ? "bg-blue-50 border-blue-200 text-blue-700" :
                        p.status === "concluido"   ? "bg-green-50 border-green-200 text-green-700" :
                        "bg-gray-50 border-gray-200 text-gray-600"
                      )}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{done}/{pTasks.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString("pt-BR") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {myProjects.length === 0 && <p className="px-5 py-8 text-xs text-gray-400 text-center">Nenhum projeto encontrado</p>}
        </div>
      </div>
    </div>
  );
}
