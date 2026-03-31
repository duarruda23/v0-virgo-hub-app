"use client";
// entregas-page-v2
import { useState, useMemo, useCallback } from "react";
import { ClientOnly } from "@/components/crm/ClientOnly";
import {
  Plus, X, Search, ChevronDown, ChevronRight, Check, Circle,
  Clock, Loader2, CheckCircle2, Users, Film, Image, Globe,
  Upload, Camera, CalendarCheck, FileCheck, ClipboardList,
  Pencil, Trash2, RefreshCw, LayoutTemplate, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDeliveries, createDelivery, updateDelivery, deleteDelivery,
  useClients, useUsers,
  useDeliveryTasks, upsertDeliveryTask, upsertDeliverySubtask,
  updateDeliveryTask, updateDeliverySubtask,
} from "@/hooks/use-data";
import type { DeliveryTask, DeliverySubtask } from "@/hooks/use-data";
import { getInitials } from "@/lib/utils-crm";

// ─── Constantes de tarefas fixas obrigatórias ────────────────────────────────
const FIXED_TASKS: { key: string; title: string; icon: React.ElementType }[] = [
  { key: "planejamento",           title: "Planejamento",                     icon: ClipboardList },
  { key: "aprovacao_planejamento", title: "Aprovação do Planejamento",        icon: FileCheck },
  { key: "marcacao_gravacao",      title: "Marcação de Gravação",             icon: CalendarCheck },
  { key: "gravacao",               title: "Gravação",                         icon: Camera },
  { key: "upload_drive",           title: "Upload no Drive",                  icon: Upload },
];

const LP_SUBTASKS: { key: string; title: string }[] = [
  { key: "criacao_visual",  title: "Criação Visual" },
  { key: "copy",            title: "Copy" },
  { key: "desenvolvimento", title: "Desenvolvimento" },
  { key: "aprovacao",       title: "Aprovação do Cliente" },
  { key: "finalizacao",     title: "Finalização / Go Live" },
];

const STATUS_CYCLE: Record<DeliveryTask["status"], DeliveryTask["status"]> = {
  pendente: "em_andamento",
  em_andamento: "concluido",
  concluido: "pendente",
};

const STATUS_ICON: Record<DeliveryTask["status"], React.ElementType> = {
  pendente: Circle,
  em_andamento: Loader2,
  concluido: CheckCircle2,
};

const STATUS_COLOR: Record<DeliveryTask["status"], string> = {
  pendente: "text-gray-300",
  em_andamento: "text-yellow-500",
  concluido: "text-green-500",
};

const STATUS_LABEL: Record<DeliveryTask["status"], string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

function formatMonth(m: string) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${months[parseInt(mo) - 1]} ${y}`;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Inicializa as tarefas padrão para uma entrega nova ──────────────────────
async function initDefaultTasks(deliveryId: string, variables: {
  designs: number; videos: number; landingPage: boolean;
}) {
  const tasks: Partial<DeliveryTask>[] = FIXED_TASKS.map((t, i) => ({
    deliveryId, type: "fixed" as const, key: t.key, title: t.title,
    status: "pendente" as const, position: i,
  }));
  if (variables.videos > 0) {
    tasks.push({ deliveryId, type: "variable", key: "videos", title: `Vídeos (${variables.videos})`, status: "pendente", quantity: variables.videos, enabled: true, position: 10 });
  }
  if (variables.designs > 0) {
    tasks.push({ deliveryId, type: "variable", key: "designs", title: `Designs (${variables.designs})`, status: "pendente", quantity: variables.designs, enabled: true, position: 11 });
  }
  if (variables.landingPage) {
    tasks.push({ deliveryId, type: "landing_page", key: "landing_page", title: "Landing Page", status: "pendente", enabled: true, position: 12 });
  }
  await Promise.all(tasks.map((t) => upsertDeliveryTask(t)));

  // Subtarefas de landing page
  if (variables.landingPage) {
    await Promise.all(LP_SUBTASKS.map((s, i) =>
      upsertDeliverySubtask({ _subtask: true, deliveryId, parentKey: "landing_page", key: s.key, title: s.title, status: "pendente", position: i })
    ));
  }
}

// ─── Componente de status clicável ───────────────────────────────────────────
function StatusButton({ status, onClick }: { status: DeliveryTask["status"]; onClick: () => void }) {
  const Icon = STATUS_ICON[status];
  return (
    <button onClick={onClick} title={STATUS_LABEL[status]}
      className={cn("transition-all hover:scale-110", STATUS_COLOR[status])}>
      <Icon size={18} className={status === "em_andamento" ? "animate-spin" : ""} />
    </button>
  );
}

// ─── Barra de progresso de landing page ──────────────────────────────────────
function LandingPageProgress({ subtasks }: { subtasks: DeliverySubtask[] }) {
  const done = subtasks.filter((s) => s.status === "concluido").length;
  const total = LP_SUBTASKS.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mt-2 pl-6 border-l-2 border-yellow-300 space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-yellow-700">Subprocesso Landing Page</span>
        <span className="text-xs font-black text-gray-700">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {subtasks.map((sub) => {
        const Icon = STATUS_ICON[sub.status];
        return (
          <div key={sub.id} className="flex items-center gap-2 text-xs text-gray-600">
            <Icon size={12} className={cn(STATUS_COLOR[sub.status], sub.status === "em_andamento" ? "animate-spin" : "")} />
            <span className={sub.status === "concluido" ? "line-through text-gray-400" : ""}>{sub.title}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Painel de tarefas de uma entrega ────────────────────────────────────────
function DeliveryTaskPanel({ delivery, users }: { delivery: { id: string; title: string }; users: Array<{ id: string; name: string }> }) {
  const { tasks, subtasks, isLoading } = useDeliveryTasks(delivery.id);

  const handleTaskStatus = useCallback(async (task: DeliveryTask) => {
    const next = STATUS_CYCLE[task.status];
    await updateDeliveryTask(task.id, { status: next, deliveryId: delivery.id });
  }, [delivery.id]);

  const handleSubStatus = useCallback(async (sub: DeliverySubtask) => {
    const next = STATUS_CYCLE[sub.status];
    await updateDeliverySubtask(sub.id, delivery.id, { status: next });
  }, [delivery.id]);

  const lpTask = tasks.find((t) => t.key === "landing_page");
  const lpSubtasks = subtasks.filter((s) => s.parentKey === "landing_page");

  const fixed = tasks.filter((t) => t.type === "fixed");
  const variable = tasks.filter((t) => t.type === "variable");

  const totalSteps = tasks.length + lpSubtasks.length;
  const doneSteps = tasks.filter((t) => t.status === "concluido").length + lpSubtasks.filter((s) => s.status === "concluido").length;
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  if (isLoading) return (
    <div className="flex items-center justify-center py-6 text-gray-400">
      <Loader2 size={16} className="animate-spin mr-2" /> Carregando tarefas...
    </div>
  );

  if (tasks.length === 0) return (
    <div className="py-6 text-center">
      <p className="text-xs text-gray-400 mb-2">Nenhuma tarefa iniciada ainda.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Barra de progresso geral */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-bold text-gray-500">Progresso geral</span>
          <span className="text-xs font-black text-gray-800">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-400" : "bg-yellow-400")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tarefas fixas */}
      {fixed.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Obrigatórias</p>
          <div className="space-y-1">
            {fixed.map((task) => {
              const Def = FIXED_TASKS.find((f) => f.key === task.key);
              const Icon = Def?.icon ?? Check;
              return (
                <div key={task.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                  <StatusButton status={task.status} onClick={() => handleTaskStatus(task)} />
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <span className={cn("text-sm flex-1", task.status === "concluido" ? "line-through text-gray-400" : "text-gray-700")}>
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tarefas variáveis */}
      {variable.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Variáveis</p>
          <div className="space-y-1">
            {variable.map((task) => {
              const Icon = task.key === "videos" ? Film : task.key === "designs" ? Image : Globe;
              return (
                <div key={task.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <StatusButton status={task.status} onClick={() => handleTaskStatus(task)} />
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <span className={cn("text-sm flex-1", task.status === "concluido" ? "line-through text-gray-400" : "text-gray-700")}>
                    {task.title}
                  </span>
                  {task.quantity && task.quantity > 1 && (
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">{task.quantity}x</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Landing page + subprocesso */}
      {lpTask && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Landing Page</p>
          <div className="py-1.5 px-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-2.5">
              <StatusButton status={lpTask.status} onClick={() => handleTaskStatus(lpTask)} />
              <Globe size={14} className="text-gray-400 flex-shrink-0" />
              <span className={cn("text-sm flex-1", lpTask.status === "concluido" ? "line-through text-gray-400" : "text-gray-700")}>
                Landing Page
              </span>
            </div>
            {lpSubtasks.length > 0 && (
              <LandingPageProgress subtasks={lpSubtasks} />
            )}
            {lpSubtasks.length > 0 && lpSubtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2.5 mt-1 py-1 px-2 pl-6 rounded hover:bg-yellow-50"
                style={{ display: "none" }}>
                <StatusButton status={sub.status} onClick={() => handleSubStatus(sub)} />
                <span className={cn("text-xs flex-1", sub.status === "concluido" ? "line-through text-gray-400" : "text-gray-600")}>
                  {sub.title}
                </span>
              </div>
            ))}
            {/* Subtarefas clicáveis */}
            <div className="mt-2 pl-6 space-y-1">
              {lpSubtasks.map((sub) => (
                <div key={sub.id}
                  className="flex items-center gap-2 cursor-pointer py-0.5 rounded hover:bg-yellow-50 px-1"
                  onClick={() => handleSubStatus(sub)}>
                  <StatusButton status={sub.status} onClick={() => handleSubStatus(sub)} />
                  <span className={cn("text-xs", sub.status === "concluido" ? "line-through text-gray-400" : "text-gray-600")}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card de uma entrega ──────────────────────────────────────────────────────
function DeliveryCard({
  delivery, users, onEdit, onDelete,
}: {
  delivery: Record<string, unknown>;
  users: Array<{ id: string; name: string }>;
  onEdit: (d: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { tasks } = useDeliveryTasks(expanded ? (delivery.id as string) : null);
  const done = tasks.filter((t) => t.status === "concluido").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{delivery.title as string}</p>
          {delivery.month && (
            <p className="text-xs text-gray-400">{formatMonth(delivery.month as string)}</p>
          )}
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-400" : "bg-yellow-400")}
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-gray-600 w-8 text-right">{pct}%</span>
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(delivery); }}
            className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors opacity-0 group-hover:opacity-100">
            <Pencil size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(delivery.id as string); }}
            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Tarefas expandidas */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <DeliveryTaskPanel delivery={{ id: delivery.id as string, title: delivery.title as string }} users={users} />
        </div>
      )}
    </div>
  );
}

// ─── Modal de nova entrega ────────────────────────────────────────────────────
function DeliveryModal({
  clients, users, onClose, onSave,
}: {
  clients: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, vars: { designs: number; videos: number; landingPage: boolean }) => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [designs, setDesigns] = useState(0);
  const [videos, setVideos] = useState(0);
  const [landingPage, setLandingPage] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-xl border-2 border-black w-full max-w-md shadow-[6px_6px_0px_#000]">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
          <h2 className="text-base font-black">Nova Entrega</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Cliente</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Título da entrega</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Entrega Mensal — Junho"
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Mês */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mês de referência</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Variáveis */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Entregáveis variáveis</p>

            <div className="flex items-center gap-3">
              <Film size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 flex-1">Vídeos</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setVideos(Math.max(0, videos - 1))}
                  className="w-7 h-7 rounded-lg border-2 border-gray-200 text-sm font-bold hover:border-black transition-colors flex items-center justify-center">−</button>
                <span className="w-6 text-center text-sm font-black">{videos}</span>
                <button onClick={() => setVideos(videos + 1)}
                  className="w-7 h-7 rounded-lg border-2 border-gray-200 text-sm font-bold hover:border-black transition-colors flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 flex-1">Designs</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setDesigns(Math.max(0, designs - 1))}
                  className="w-7 h-7 rounded-lg border-2 border-gray-200 text-sm font-bold hover:border-black transition-colors flex items-center justify-center">−</button>
                <span className="w-6 text-center text-sm font-black">{designs}</span>
                <button onClick={() => setDesigns(designs + 1)}
                  className="w-7 h-7 rounded-lg border-2 border-gray-200 text-sm font-bold hover:border-black transition-colors flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 flex-1">Landing Page</span>
              <button onClick={() => setLandingPage((v) => !v)}
                className={cn("w-11 h-6 rounded-full border-2 transition-colors relative",
                  landingPage ? "bg-yellow-400 border-yellow-400" : "bg-gray-200 border-gray-200")}>
                <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full border border-gray-200 shadow transition-all",
                  landingPage ? "left-[calc(100%-1.25rem)]" : "left-0.5")} />
              </button>
            </div>
          </div>

          {/* Tarefas fixas (informativo) */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tarefas obrigatórias incluídas</p>
            <div className="space-y-1">
              {FIXED_TASKS.map((t) => (
                <div key={t.key} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                  {t.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!clientId || !title) return;
              onSave({ clientId, title, month, status: "em_andamento" }, { designs, videos, landingPage });
            }}
            disabled={!clientId || !title}
            className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
            Criar Entrega
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EntregasPage() {
  const { deliveries, isLoading } = useDeliveries();
  const { clients } = useClients();
  const { users } = useUsers();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Agrupa por cliente
  const byClient = useMemo(() => {
    const filtered = search
      ? deliveries.filter((d) => (d.title as string)?.toLowerCase().includes(search.toLowerCase()))
      : deliveries;

    const map: Record<string, { client: { id: string; name: string } | null; deliveries: typeof filtered }> = {};
    filtered.forEach((d) => {
      const cId = (d.clientId as string) ?? "__sem_cliente";
      if (!map[cId]) {
        const client = clients.find((c) => c.id === cId) ?? null;
        map[cId] = { client: client ? { id: client.id, name: client.name } : null, deliveries: [] };
      }
      map[cId].deliveries.push(d);
    });
    return Object.values(map).sort((a, b) => (a.client?.name ?? "").localeCompare(b.client?.name ?? ""));
  }, [deliveries, clients, search]);

  const handleCreate = async (data: Record<string, unknown>, vars: { designs: number; videos: number; landingPage: boolean }) => {
    setCreating(true);
    try {
      const created = await createDelivery(data);
      await initDefaultTasks(created.id, vars);
    } finally {
      setCreating(false);
      setShowModal(false);
    }
  };

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar entrega..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-yellow-400 text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_#000]">
            <Plus size={16} /> Nova Entrega
          </button>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Carregando entregas...
          </div>
        ) : byClient.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl p-16 text-center shadow-[3px_3px_0px_#000]">
            <LayoutTemplate size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-base font-black text-gray-700 mb-1">Nenhuma entrega cadastrada</p>
            <p className="text-sm text-gray-400 mb-4">Crie a primeira entrega para começar a rastrear o progresso</p>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-black text-yellow-400 text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Criar Entrega
            </button>
          </div>
        ) : (
          byClient.map(({ client, deliveries: dels }) => (
            <div key={client?.id ?? "__sem_cliente"}>
              {/* Header do cliente */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-black text-yellow-400 flex items-center justify-center text-xs font-black shrink-0">
                  {client ? getInitials(client.name) : "?"}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{client?.name ?? "Sem cliente"}</p>
                  <p className="text-xs text-gray-400">{dels.length} entrega(s)</p>
                </div>
              </div>

              {/* Cards de entrega */}
              <div className="space-y-2 ml-11">
                {dels.map((d) => (
                  <DeliveryCard
                    key={d.id}
                    delivery={d as Record<string, unknown>}
                    users={users.map((u) => ({ id: u.id, name: u.name }))}
                    onEdit={() => {}}
                    onDelete={async (id) => { await deleteDelivery(id); }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <DeliveryModal
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          users={users.map((u) => ({ id: u.id, name: u.name }))}
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* Loading overlay ao criar */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border-2 border-black px-8 py-6 shadow-[4px_4px_0px_#000] flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-yellow-500" />
            <span className="text-sm font-bold text-gray-800">Criando entrega e tarefas...</span>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}
