"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useProjects, useLeads, useClients, useTasks } from "@/hooks/use-data";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/utils-crm";

export default function CRMDashboard() {
  const { projects } = useProjects();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { tasks } = useTasks();
  const router = useRouter();

  // Projetos em andamento (em_execucao, planejamento, briefing, revisao)
  const ongoingProjects = useMemo(() => {
    return projects.filter((p) =>
      ["briefing", "planejamento", "em_execucao", "revisao", "aprovacao"].includes(p.status)
    );
  }, [projects]);

  // Leads ativos (não ganho, não perdido)
  const activeLeads = useMemo(() => {
    return leads.filter((l) => l.status !== "ganho" && l.status !== "perdido");
  }, [leads]);

  // Tarefas atrasadas
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "concluida");
  }, [tasks]);

  // KPI: Total MRR
  const totalMRR = useMemo(() => {
    return clients
      .filter((c) => c.status === "ativo")
      .reduce((sum, c) => sum + c.mrr, 0);
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="MRR Ativo" value={`R$ ${(totalMRR / 1000).toFixed(1)}k`} />
        <KPICard label="Clientes" value={clients.filter((c) => c.status === "ativo").length.toString()} />
        <KPICard label="Leads Ativos" value={activeLeads.length.toString()} />
        <KPICard label="Tarefas Atrasadas" value={overdueTasks.length.toString()} highlight={overdueTasks.length > 0} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projetos em Andamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Projetos em Andamento</h3>
            <Link href="/projetos" className="text-yellow-500 text-sm font-bold hover:text-yellow-600 flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          {ongoingProjects.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum projeto em andamento</p>
          ) : (
            <div className="space-y-2">
              {ongoingProjects.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/projetos`)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-600">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{PROJECT_STATUS_LABELS[p.status]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-600">{p.progress}%</p>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${p.progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leads Ativos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Leads Quentes</h3>
            <Link href="/crm" className="text-yellow-500 text-sm font-bold hover:text-yellow-600 flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          {activeLeads.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum lead ativo</p>
          ) : (
            <div className="space-y-2">
              {activeLeads.slice(0, 4).map((l) => (
                <div key={l.id} className="p-2 rounded-lg bg-gray-50 border-l-2 border-yellow-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{l.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.company}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-600">R$ {(l.value / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Tarefas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Tarefas Críticas</h3>
            <Link href="/tarefas" className="text-yellow-500 text-sm font-bold hover:text-yellow-600 flex items-center gap-1">
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>
          {overdueTasks.length === 0 ? (
            <p className="text-xs text-gray-400">Sem tarefas atrasadas</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="p-2 rounded-lg bg-red-50 border-l-2 border-red-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString("pt-BR") : "Sem data"}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${PRIORITY_COLORS[t.priority]}`}>
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <p className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-black mt-1 ${highlight ? "text-red-900" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
