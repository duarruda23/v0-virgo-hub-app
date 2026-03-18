"use client";
import { useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useClientsStore, useCRMStore, useProjectsStore, useTasksStore, useDeliveriesStore, useUsersStore, useProductsStore } from "@/lib/store";
import { formatCurrency, PROJECT_STATUS_LABELS, DELIVERY_STATUS_LABELS } from "@/lib/utils-crm";
import { cn } from "@/lib/utils";

const COLORS = ["#FACC15", "#111827", "#3B82F6", "#22C55E", "#F97316", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function RelatoriosPage() {
  const { clients } = useClientsStore();
  const { leads } = useCRMStore();
  const { projects } = useProjectsStore();
  const { tasks } = useTasksStore();
  const { deliveries } = useDeliveriesStore();
  const { users } = useUsersStore();
  const { products } = useProductsStore();

  // MRR acumulado mês a mês com base nos clientes reais
  // Gera os últimos 6 meses a partir do mês atual
  const mrrData = useMemo(() => {
    const now = new Date();
    const months: { key: string; mes: string; mrr: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-based
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" });
      months.push({ key, mes: label, mrr: 0 });
    }

    // Para cada mês, soma o MRR de todos os clientes ativos criados até aquele mês
    months.forEach((m) => {
      const [y, mo] = m.key.split("-").map(Number);
      const endOfMonth = new Date(y, mo, 0, 23, 59, 59); // último dia do mês
      m.mrr = clients
        .filter((c) => c.status === "ativo" && new Date(c.createdAt) <= endOfMonth)
        .reduce((sum, c) => sum + c.mrr, 0);
    });

    return months;
  }, [clients]);

  // Clientes por status
  const clientsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({
      name: status === "ativo" ? "Ativo" : status === "inativo" ? "Inativo" : status === "prospecto" ? "Prospecto" : "Churned",
      value: count,
    }));
  }, [clients]);

  // MRR por tier
  const mrrByTier = useMemo(() => {
    const map: Record<string, number> = {};
    clients.filter((c) => c.status === "ativo").forEach((c) => {
      map[c.tier] = (map[c.tier] || 0) + c.mrr;
    });
    return Object.entries(map).map(([tier, mrr]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1), mrr,
    }));
  }, [clients]);

  // Leads por origem
  const leadsBySource = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => { map[l.source] = (map[l.source] || 0) + 1; });
    const labels: Record<string, string> = { indicacao: "Indicação", site: "Site", redes_sociais: "Redes Sociais", email: "Email", evento: "Evento", outros: "Outros" };
    return Object.entries(map).map(([source, count]) => ({ name: labels[source] || source, value: count }));
  }, [leads]);

  // Projetos por status
  const projectsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({
      name: PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] || status, count,
    }));
  }, [projects]);

  // Tarefas por membro
  const tasksByUser = useMemo(() => {
    return users.filter((u) => u.active).map((u) => ({
      name: u.name.split(" ")[0],
      abertas: tasks.filter((t) => t.assigneeId === u.id && t.status !== "concluida").length,
      concluidas: tasks.filter((t) => t.assigneeId === u.id && t.status === "concluida").length,
    })).filter((u) => u.abertas + u.concluidas > 0);
  }, [users, tasks]);

  // Entregas por status
  const deliveriesByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    deliveries.forEach((d) => { map[d.status] = (map[d.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({
      name: DELIVERY_STATUS_LABELS[status as keyof typeof DELIVERY_STATUS_LABELS] || status, count,
    }));
  }, [deliveries]);

  // KPIs
  const totalMRR = useMemo(() => clients.filter((c) => c.status === "ativo").reduce((s, c) => s + c.mrr, 0), [clients]);
  const totalPipeline = useMemo(() => leads.filter((l) => l.status !== "perdido" && l.status !== "ganho").reduce((s, l) => s + l.value, 0), [leads]);
  const conversionRate = useMemo(() => {
    const closed = leads.filter((l) => l.status === "ganho" || l.status === "perdido").length;
    const won = leads.filter((l) => l.status === "ganho").length;
    return closed > 0 ? Math.round((won / closed) * 100) : 0;
  }, [leads]);
  const avgProjectProgress = useMemo(() => {
    const active = projects.filter((p) => p.status !== "concluido" && p.status !== "cancelado");
    return active.length > 0 ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length) : 0;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="MRR Atual"
          value={formatCurrency(totalMRR)}
          delta={(() => {
            const prev = mrrData.length >= 2 ? mrrData[mrrData.length - 2].mrr : 0;
            if (prev === 0) return totalMRR > 0 ? "Novo" : "Sem dados";
            const diff = totalMRR - prev;
            const pct = Math.round((diff / prev) * 100);
            return `${pct >= 0 ? "+" : ""}${pct}% vs mês anterior`;
          })()}
          positive={mrrData.length >= 2 ? totalMRR >= mrrData[mrrData.length - 2].mrr : false}
        />
        <KPICard label="Pipeline CRM" value={formatCurrency(totalPipeline)} delta={`${leads.filter(l => l.status !== "perdido" && l.status !== "ganho").length} leads`} />
        <KPICard label="Taxa de Conversão" value={`${conversionRate}%`} delta="Fechados" />
        <KPICard label="Progresso Médio" value={`${avgProjectProgress}%`} delta="Projetos ativos" />
      </div>

      {/* Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="Evolução do MRR" sub="Últimos 6 meses" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke="#FACC15" strokeWidth={2.5} fill="url(#mrrG)" dot={{ fill: "#FACC15", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="Clientes por Status" sub="Distribuição atual" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={clientsByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {clientsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="MRR por Tier de Cliente" sub="Receita recorrente mensal" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mrrByTier} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), "MRR"]} />
              <Bar dataKey="mrr" fill="#FACC15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="Leads por Origem" sub="Todos os leads" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={leadsBySource} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="Tarefas por Membro" sub="Abertas vs. concluídas" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tasksByUser} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="abertas" name="Abertas" fill="#FACC15" radius={[4, 4, 0, 0]} />
              <Bar dataKey="concluidas" name="Concluídas" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ChartTitle title="Entregas por Status" sub="Situação atual" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deliveriesByStatus} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" name="Entregas" radius={[0, 4, 4, 0]}>
                {deliveriesByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <ChartTitle title="Status dos Projetos" sub="Resumo por situação" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {projectsByStatus.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <div>
                <p className="text-xs text-gray-500">{item.name}</p>
                <p className="text-xl font-black text-gray-900">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <p className="font-bold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function KPICard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      <p className={cn("text-xs mt-1 font-medium", positive ? "text-green-600" : "text-gray-500")}>{delta}</p>
    </div>
  );
}
