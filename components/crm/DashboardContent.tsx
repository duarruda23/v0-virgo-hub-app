"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, FolderKanban, CheckSquare,
  DollarSign, AlertCircle, ArrowRight, Clock, Calendar, Users, Package
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import {
  useClientsStore, useCRMStore, useProjectsStore,
  useTasksStore, useDeliveriesStore, useUsersStore, useProductsStore
} from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  formatCurrency, formatDate,
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS,
  TASK_STATUS_LABELS,
  getInitials
} from "@/lib/utils-crm";

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function DashboardContent() {
  const { clients } = useClientsStore();
  const { leads } = useCRMStore();
  const { projects } = useProjectsStore();
  const { tasks } = useTasksStore();
  const { deliveries } = useDeliveriesStore();
  const { users } = useUsersStore();
  const { products } = useProductsStore();
  const now = new Date();

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const activeClients = useMemo(() => clients.filter((c) => c.status === "ativo"), [clients]);
  const totalMRR = useMemo(() => activeClients.reduce((sum, c) => sum + c.mrr, 0), [activeClients]);

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "em_execucao" || p.status === "revisao"),
    [projects]
  );
  const openTasks = useMemo(() => tasks.filter((t) => t.status !== "concluida"), [tasks]);
  const overdueTasks = useMemo(
    () => openTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openTasks]
  );
  const overdueDeliveries = useMemo(
    () => deliveries.filter((d) => d.status !== "entregue" && d.status !== "cancelado" && new Date(d.dueDate) < now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deliveries]
  );
  const hotLeads = useMemo(
    () => leads.filter((l) => l.status === "proposta" || l.status === "negociacao"),
    [leads]
  );
  const hotLeadsPotential = useMemo(
    () => hotLeads.reduce((s, l) => s + l.value, 0),
    [hotLeads]
  );

  // ── Gráfico MRR (últimos 6 meses com base nos clientes ativos) ─────────────
  const mrrChartData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const cutoff = new Date(d.getFullYear(), d.getMonth() + 1, 0); // último dia do mês
      const mrr = clients
        .filter((c) => c.status === "ativo" && new Date(c.createdAt) <= cutoff)
        .reduce((sum, c) => sum + c.mrr, 0);
      result.push({ mes: PT_MONTHS[d.getMonth()], mrr });
    }
    return result;
  }, [clients]);

  // ── Gráfico Pipeline (leads por status) ────────────────────────────────────
  const pipelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] ?? 0) + 1;
    });
    const order = ["novo", "em_contato", "proposta", "negociacao", "ganho"];
    return order
      .filter((s) => counts[s])
      .map((s) => ({ stage: LEAD_STATUS_LABELS[s as keyof typeof LEAD_STATUS_LABELS], count: counts[s], status: s }));
  }, [leads]);

  // ── Gráfico Tarefas por status ─────────────────────────────────────────────
  const tasksByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });
    const COLORS: Record<string, string> = {
      backlog: "#E5E7EB", a_fazer: "#FCD34D", em_progresso: "#60A5FA",
      em_revisao: "#F97316", concluida: "#34D399",
    };
    return Object.entries(counts).map(([status, value]) => ({
      name: TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] ?? status,
      value,
      fill: COLORS[status] ?? "#E5E7EB",
    }));
  }, [tasks]);

  // ── Listas ─────────────────────────────────────────────────────────────────
  const recentTasks = useMemo(() => openTasks.slice(0, 6), [openTasks]);
  const upcomingDeliveries = useMemo(
    () => deliveries
      .filter((d) => d.status !== "entregue" && d.status !== "cancelado")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4),
    [deliveries]
  );

  // ── MRR delta ─────────────────────────────────────────────────────────────
  const mrrDelta = useMemo(() => {
    if (mrrChartData.length < 2) return null;
    const prev = mrrChartData[mrrChartData.length - 2].mrr;
    const curr = mrrChartData[mrrChartData.length - 1].mrr;
    if (prev === 0) return null;
    const pct = ((curr - prev) / prev) * 100;
    return pct;
  }, [mrrChartData]);

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="MRR Total"
          value={formatCurrency(totalMRR)}
          sub={`${activeClients.length} cliente${activeClients.length !== 1 ? "s" : ""} ativo${activeClients.length !== 1 ? "s" : ""}`}
          icon={<DollarSign size={18} />}
          accent="bg-yellow-400"
        />
        <KPICard
          label="Projetos Ativos"
          value={String(activeProjects.length)}
          sub={`${projects.filter((p) => p.status === "concluido").length} concluído${projects.filter((p) => p.status === "concluido").length !== 1 ? "s" : ""}`}
          icon={<FolderKanban size={18} />}
          accent="bg-blue-500"
        />
        <KPICard
          label="Leads Quentes"
          value={String(hotLeads.length)}
          sub={hotLeadsPotential > 0 ? `${formatCurrency(hotLeadsPotential)} potencial` : "Nenhum em negociação"}
          icon={<TrendingUp size={18} />}
          accent="bg-green-500"
        />
        <KPICard
          label="Tarefas Abertas"
          value={String(openTasks.length)}
          sub={
            overdueDeliveries.length > 0
              ? `${overdueDeliveries.length} entrega${overdueDeliveries.length !== 1 ? "s" : ""} atrasada${overdueDeliveries.length !== 1 ? "s" : ""}`
              : overdueTasks.length > 0
              ? `${overdueTasks.length} tarefa${overdueTasks.length !== 1 ? "s" : ""} atrasada${overdueTasks.length !== 1 ? "s" : ""}`
              : "Sem atrasos"
          }
          icon={
            overdueDeliveries.length > 0 || overdueTasks.length > 0
              ? <AlertCircle size={18} />
              : <CheckSquare size={18} />
          }
          accent={overdueDeliveries.length > 0 || overdueTasks.length > 0 ? "bg-red-500" : "bg-emerald-500"}
        />
      </div>

      {/* ── Stats adicionais ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge label="Total de Clientes" value={clients.length} icon={<Users size={14} />} />
        <StatBadge label="Leads no Pipeline" value={leads.filter((l) => l.status !== "ganho" && l.status !== "perdido").length} icon={<TrendingUp size={14} />} />
        <StatBadge label="Entregas Pendentes" value={deliveries.filter((d) => d.status !== "entregue" && d.status !== "cancelado").length} icon={<Package size={14} />} />
        <StatBadge label="Membros da Equipe" value={users.filter((u) => u.active).length} icon={<Users size={14} />} />
      </div>

      {/* ── Gráficos ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* MRR */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">Evolução do MRR</p>
              <p className="text-xs text-gray-400 mt-0.5">Baseado nos clientes ativos por mês</p>
            </div>
            {mrrDelta !== null && (
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                mrrDelta >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {mrrDelta >= 0 ? "+" : ""}{mrrDelta.toFixed(1)}% vs. mês anterior
              </span>
            )}
          </div>
          {totalMRR === 0 ? (
            <EmptyChart message="Cadastre clientes com MRR para visualizar a evolução" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={mrrChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), "MRR"]} labelStyle={{ fontWeight: 700 }} />
                <Area type="monotone" dataKey="mrr" stroke="#FACC15" strokeWidth={2.5} fill="url(#mrrGrad)" dot={{ fill: "#FACC15", strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-4">
            <p className="font-bold text-gray-900 text-sm">Pipeline CRM</p>
            <p className="text-xs text-gray-400 mt-0.5">{leads.length} lead{leads.length !== 1 ? "s" : ""} no total</p>
          </div>
          {leads.length === 0 ? (
            <EmptyChart message="Adicione leads ao CRM para ver o pipeline" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={56} />
                <Tooltip formatter={(v: number) => [v, "Leads"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.status === "ganho" ? "#22C55E" : entry.status === "negociacao" ? "#FACC15" : entry.status === "proposta" ? "#60A5FA" : "#E5E7EB"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Segunda linha de gráficos ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Tarefas por status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-bold text-gray-900 text-sm mb-1">Tarefas por Status</p>
          <p className="text-xs text-gray-400 mb-4">{tasks.length} tarefa{tasks.length !== 1 ? "s" : ""} no total</p>
          {tasks.length === 0 ? (
            <EmptyChart message="Crie tarefas para visualizar a distribuição" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={tasksByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={64} paddingAngle={2}>
                  {tasksByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Projetos ativos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Projetos em Andamento</p>
            <Link href="/projetos" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeProjects.slice(0, 4).map((project) => {
              const client = clients.find((c) => c.id === project.clientId);
              return (
                <div key={project.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-900 truncate flex-1 mr-2">{project.name}</p>
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">{project.progress}%</span>
                  </div>
                  {client && <p className="text-xs text-gray-400">{client.company ?? client.name}</p>}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              );
            })}
            {activeProjects.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum projeto em andamento</p>
            )}
          </div>
        </div>

        {/* Entregas próximas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Próximas Entregas</p>
            <Link href="/entregas" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingDeliveries.map((delivery) => {
              const responsible = users.find((u) => u.id === delivery.responsibleId);
              const isLate = new Date(delivery.dueDate) < now;
              return (
                <div key={delivery.id} className="flex items-center gap-2.5">
                  <div className={cn("w-1 h-8 rounded-full flex-shrink-0", isLate ? "bg-red-400" : "bg-yellow-400")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{delivery.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} className="text-gray-400" />
                      <p className={cn("text-[10px]", isLate ? "text-red-500 font-semibold" : "text-gray-400")}>
                        {formatDate(delivery.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", DELIVERY_STATUS_COLORS[delivery.status])}>
                      {DELIVERY_STATUS_LABELS[delivery.status]}
                    </span>
                    {responsible && (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center" title={responsible.name}>
                        <span className="text-[8px] font-bold text-gray-600">{getInitials(responsible.name)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {upcomingDeliveries.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma entrega pendente</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Linha inferior ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Leads quentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Leads Quentes</p>
            <Link href="/crm" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Pipeline <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {hotLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-yellow-700">{getInitials(lead.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-400 truncate">{lead.company}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(lead.value)}</p>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", LEAD_STATUS_COLORS[lead.status])}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </div>
              </div>
            ))}
            {hotLeads.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum lead em proposta ou negociação</p>
            )}
          </div>
        </div>

        {/* Tarefas pendentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Tarefas Pendentes</p>
            <Link href="/tarefas" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {recentTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              const isLate = task.dueDate && new Date(task.dueDate) < now;
              const relatedProject = task.projectId ? projects.find((p) => p.id === task.projectId) : null;
              return (
                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    task.priority === "urgente" && "bg-red-500",
                    task.priority === "alta" && "bg-orange-500",
                    task.priority === "media" && "bg-blue-500",
                    task.priority === "baixa" && "bg-gray-400",
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {relatedProject && (
                        <span className="text-[10px] text-blue-500 font-medium truncate">{relatedProject.name}</span>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={9} className={cn(isLate ? "text-red-400" : "text-gray-300")} />
                          <p className={cn("text-[10px]", isLate ? "text-red-500 font-semibold" : "text-gray-400")}>
                            {formatDate(task.dueDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0", PRIORITY_COLORS[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  {assignee && (
                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0" title={assignee.name}>
                      <span className="text-[9px] font-bold text-yellow-400">{getInitials(assignee.name)}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {recentTasks.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhuma tarefa pendente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0", accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{value}</p>
        <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>
      </div>
    </div>
  );
}

function StatBadge({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-lg font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center">
      <p className="text-xs text-gray-400 text-center max-w-[160px]">{message}</p>
    </div>
  );
}
