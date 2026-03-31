"use client";
import { useMemo } from "react";
import { CheckSquare, Clock, AlertCircle, TrendingUp, Palette, Video, ShoppingBag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks, useProjects } from "@/hooks/use-data";
import { useAuthStore } from "@/lib/store";
import type { DashboardView } from "@/hooks/use-dashboard-view";

const PRIORITY_COLORS: Record<string, string> = {
  urgente: "bg-red-100 text-red-700 border-red-200",
  alta:    "bg-orange-100 text-orange-700 border-orange-200",
  media:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa:   "bg-gray-100 text-gray-600 border-gray-200",
};
const PRIORITY_LABELS: Record<string, string> = { urgente: "Urgente", alta: "Alta", media: "Média", baixa: "Baixa" };
const STATUS_COLORS: Record<string, string> = {
  a_fazer:      "bg-gray-100 text-gray-700",
  em_andamento: "bg-blue-100 text-blue-700",
  em_revisao:   "bg-yellow-100 text-yellow-800",
  concluida:    "bg-green-100 text-green-700",
};
const STATUS_LABELS: Record<string, string> = {
  a_fazer: "A Fazer", em_andamento: "Em Andamento", em_revisao: "Em Revisão", concluida: "Concluída",
};

const VIEW_META: Record<DashboardView, { icon: React.ReactNode; label: string; accent: string; tagline: string }> = {
  admin:       { icon: <TrendingUp size={18} />,  label: "Admin",          accent: "bg-yellow-400", tagline: "" },
  leader:      { icon: <TrendingUp size={18} />,  label: "Líder",          accent: "bg-blue-400",   tagline: "" },
  designer:    { icon: <Palette size={18} />,      label: "Designer",       accent: "bg-purple-400", tagline: "Seus projetos de design e artes" },
  video_editor:{ icon: <Video size={18} />,        label: "Editor de Vídeo",accent: "bg-red-400",    tagline: "Produções e edições em andamento" },
  seller:      { icon: <ShoppingBag size={18} />,  label: "Vendedor",       accent: "bg-green-400",  tagline: "Pipeline de vendas e negociações" },
  social_media:{ icon: <Globe size={18} />,        label: "Social Media",   accent: "bg-pink-400",   tagline: "Pautas e publicações das redes" },
  collaborator:{ icon: <CheckSquare size={18} />,  label: "Colaborador",    accent: "bg-gray-400",   tagline: "Suas tarefas e projetos" },
};

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

export default function CollaboratorDashboard({ view }: { view: DashboardView }) {
  const currentUser = useAuthStore((s) => s.user);
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const meta = VIEW_META[view] ?? VIEW_META.collaborator;

  // Tarefas do usuário logado
  const myTasks = useMemo(() =>
    tasks.filter((t) => t.assigneeId === currentUser?.id), [tasks, currentUser]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const abertas    = myTasks.filter((t) => t.status !== "concluida");
  const atrasadas  = abertas.filter((t) => t.dueDate && new Date(t.dueDate) < today);
  const urgentes   = abertas.filter((t) => t.priority === "urgente");
  const concluidas = myTasks.filter((t) => t.status === "concluida");
  const totalHours = abertas.reduce((s, t) => s + ((t as typeof t & { estimatedHours?: number }).estimatedHours ?? 1), 0);

  // Projetos onde participo
  const myProjects = projects.filter((p) =>
    p.managerId === currentUser?.id || (p.teamIds ?? []).includes(currentUser?.id ?? "")
  );

  // Próximas por deadline
  const upcoming = abertas
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10);

  // Por status
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    abertas.forEach((t) => { map[t.status] = (map[t.status] ?? 0) + 1; });
    return map;
  }, [abertas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]", meta.accent)}>
          {meta.icon}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Olá, {currentUser?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500">{meta.tagline || "Suas tarefas e entregas"}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Tarefas Abertas" value={String(abertas.length)} sub={`${concluidas.length} concluídas`} icon={<CheckSquare size={18} />} color={meta.accent} />
        <KPI label="Horas Estimadas" value={`${totalHours.toFixed(1)}h`} sub="carga de trabalho" icon={<Clock size={18} />} color="bg-blue-300" />
        <KPI label="Urgentes" value={String(urgentes.length)} sub="prioridade máxima" icon={<AlertCircle size={18} />} color="bg-orange-300" />
        <KPI label="Atrasadas" value={String(atrasadas.length)} sub="precisa de atenção" icon={<AlertCircle size={18} />} color={atrasadas.length > 0 ? "bg-red-300" : "bg-gray-200"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximas tarefas */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
          <div className="px-5 py-3 border-b-2 border-gray-100 flex items-center justify-between">
            <span className="text-sm font-black">Minhas Tarefas</span>
            <a href="/tarefas" className="text-xs text-yellow-600 font-bold hover:underline">Ver kanban</a>
          </div>
          <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
            {upcoming.map((t) => {
              const isLate = new Date(t.dueDate!) < today;
              const est = (t as typeof t & { estimatedHours?: number }).estimatedHours;
              return (
                <div key={t.id} className="px-5 py-3 flex items-start gap-3 group hover:bg-gray-50 transition-colors">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    t.priority === "urgente" ? "bg-red-500" :
                    t.priority === "alta"    ? "bg-orange-400" :
                    t.priority === "media"   ? "bg-yellow-400" : "bg-gray-300"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", STATUS_COLORS[t.status])}>
                        {STATUS_LABELS[t.status]}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={9} className={isLate ? "text-red-400" : "text-gray-400"} />
                        <span className={cn("text-[10px]", isLate ? "text-red-500 font-bold" : "text-gray-400")}>
                          {new Date(t.dueDate!).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {est && (
                        <span className="text-[10px] text-blue-500 font-semibold">{est}h</span>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0", PRIORITY_COLORS[t.priority])}>
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="px-5 py-10 text-center">
                <CheckSquare size={24} className="mx-auto text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Nenhuma tarefa pendente com prazo definido</p>
              </div>
            )}
          </div>
          {/* Tarefas sem prazo */}
          {abertas.filter((t) => !t.dueDate).length > 0 && (
            <div className="px-5 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400">
                + {abertas.filter((t) => !t.dueDate).length} tarefa(s) sem prazo definido
              </p>
            </div>
          )}
        </div>

        {/* Status + Projetos */}
        <div className="space-y-4">
          {/* Distribuição por status */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="px-5 py-3 border-b-2 border-gray-100">
              <span className="text-sm font-black">Por Status</span>
            </div>
            <div className="p-4 space-y-2">
              {Object.entries(STATUS_LABELS).filter(([k]) => k !== "concluida").map(([k, label]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 w-28 text-center", STATUS_COLORS[k])}>
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full transition-all"
                      style={{ width: abertas.length ? `${((byStatus[k] ?? 0) / abertas.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-[10px] font-black text-gray-700 w-4 text-right">{byStatus[k] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meus projetos */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="px-5 py-3 border-b-2 border-gray-100">
              <span className="text-sm font-black">Meus Projetos ({myProjects.length})</span>
            </div>
            <div className="divide-y divide-gray-100">
              {myProjects.slice(0, 5).map((p) => {
                const pTasks = tasks.filter((t) => t.projectId === p.id);
                const done = pTasks.filter((t) => t.status === "concluida").length;
                const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
                return (
                  <div key={p.id} className="px-5 py-3">
                    <p className="text-xs font-bold text-gray-900 truncate mb-1">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{pct}%</span>
                    </div>
                  </div>
                );
              })}
              {myProjects.length === 0 && <p className="px-5 py-4 text-xs text-gray-400 text-center">Nenhum projeto</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
