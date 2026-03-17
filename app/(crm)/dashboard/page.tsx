"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, Users, FolderKanban, CheckSquare,
  DollarSign, AlertCircle, ArrowRight, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { useClientsStore, useCRMStore, useProjectsStore, useTasksStore, useDeliveriesStore, useUsersStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  formatCurrency, formatDate,
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS,
  getInitials
} from "@/lib/utils-crm";

const MRR_DATA = [
  { mes: "Out", mrr: 24000 },
  { mes: "Nov", mrr: 27500 },
  { mes: "Dez", mrr: 26000 },
  { mes: "Jan", mrr: 30000 },
  { mes: "Fev", mrr: 31500 },
  { mes: "Mar", mrr: 31500 },
];

const PIPELINE_DATA = [
  { stage: "Novo", count: 1 },
  { stage: "Contato", count: 1 },
  { stage: "Proposta", count: 2 },
  { stage: "Negoc.", count: 1 },
  { stage: "Ganho", count: 1 },
];

export default function DashboardPage() {
  const { clients } = useClientsStore();
  const { leads } = useCRMStore();
  const { projects } = useProjectsStore();
  const { tasks } = useTasksStore();
  const { deliveries } = useDeliveriesStore();
  const { users } = useUsersStore();

  const activeClients = useMemo(() => clients.filter((c) => c.status === "ativo"), [clients]);
  const totalMRR = useMemo(() => activeClients.reduce((sum, c) => sum + c.mrr, 0), [activeClients]);
  const activeProjects = useMemo(() => projects.filter((p) => p.status === "em_execucao" || p.status === "revisao"), [projects]);
  const openTasks = useMemo(() => tasks.filter((t) => t.status !== "concluida"), [tasks]);
  const overdueDeliveries = useMemo(() => deliveries.filter((d) => {
    return d.status !== "entregue" && d.status !== "cancelado" && new Date(d.dueDate) < new Date();
  }), [deliveries]);
  const hotLeads = useMemo(() => leads.filter((l) => l.status === "proposta" || l.status === "negociacao"), [leads]);
  const recentTasks = useMemo(() => tasks.filter((t) => t.status !== "concluida").slice(0, 5), [tasks]);
  const urgentDeliveries = useMemo(() => deliveries.filter((d) => d.status !== "entregue" && d.status !== "cancelado").slice(0, 4), [deliveries]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="MRR Total"
          value={formatCurrency(totalMRR)}
          sub={`${activeClients.length} clientes ativos`}
          icon={<DollarSign size={18} />}
          accent="bg-yellow-400"
        />
        <KPICard
          label="Projetos Ativos"
          value={String(activeProjects.length)}
          sub={`${projects.filter(p => p.status === "concluido").length} concluídos`}
          icon={<FolderKanban size={18} />}
          accent="bg-blue-500"
        />
        <KPICard
          label="Leads Quentes"
          value={String(hotLeads.length)}
          sub={formatCurrency(hotLeads.reduce((s, l) => s + l.value, 0)) + " potencial"}
          icon={<TrendingUp size={18} />}
          accent="bg-green-500"
        />
        <KPICard
          label="Tarefas Abertas"
          value={String(openTasks.length)}
          sub={overdueDeliveries.length > 0 ? `${overdueDeliveries.length} entregas atrasadas` : "Nenhum atraso"}
          icon={overdueDeliveries.length > 0 ? <AlertCircle size={18} /> : <CheckSquare size={18} />}
          accent={overdueDeliveries.length > 0 ? "bg-red-500" : "bg-emerald-500"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* MRR Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 text-sm">Evolução do MRR</p>
              <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+5% vs. mês anterior</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MRR_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-4">
            <p className="font-bold text-gray-900 text-sm">Pipeline CRM</p>
            <p className="text-xs text-gray-400 mt-0.5">Leads por etapa</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PIPELINE_DATA} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v: number) => [v, "Leads"]} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {PIPELINE_DATA.map((_, i) => (
                  <Cell key={i} fill={i === 4 ? "#22C55E" : i === 3 ? "#FACC15" : "#E5E7EB"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Projects */}
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
                <div key={project.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">{client?.company ?? client?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">{project.progress}%</span>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Entregas Próximas</p>
            <Link href="/entregas" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {urgentDeliveries.map((delivery) => {
              const responsible = users.find((u) => u.id === delivery.responsibleId);
              const isLate = new Date(delivery.dueDate) < new Date();
              return (
                <div key={delivery.id} className="flex items-center gap-3">
                  <div className={cn("w-1.5 h-8 rounded-full flex-shrink-0", isLate ? "bg-red-400" : "bg-yellow-400")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{delivery.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                      <p className={cn("text-xs", isLate ? "text-red-500 font-semibold" : "text-gray-400")}>
                        {formatDate(delivery.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", DELIVERY_STATUS_COLORS[delivery.status])}>
                      {DELIVERY_STATUS_LABELS[delivery.status]}
                    </span>
                    {responsible && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" title={responsible.name}>
                        <span className="text-[9px] font-bold text-gray-600">{getInitials(responsible.name)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hot Leads */}
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
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", LEAD_STATUS_COLORS[lead.status])}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-sm">Tarefas Pendentes</p>
            <Link href="/tarefas" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
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
                    {task.dueDate && (
                      <p className={cn("text-xs mt-0.5", new Date(task.dueDate) < new Date() ? "text-red-500 font-semibold" : "text-gray-400")}>
                        Vence {formatDate(task.dueDate)}
                      </p>
                    )}
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
          </div>
        </div>
      </div>
    </div>
  );
}

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
