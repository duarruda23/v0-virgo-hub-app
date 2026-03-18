"use client";
import { useState, useRef } from "react";
import {
  Plus, X, Phone, Mail, Building2, DollarSign, Calendar,
  Pencil, Trash2, Search, Settings2, GripVertical, Check,
  Webhook, ListTodo, ChevronDown, ChevronRight, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePipelineStore, useAuthStore } from "@/lib/store";
import { useLeads, createLead, updateLead, deleteLead, useUsers, createTask, useAutomations, createAutomation, updateAutomation, deleteAutomation, type AutomationRecord } from "@/hooks/use-data";
import type { PipelineStage } from "@/lib/store";
import type { Lead, LeadSource, Task } from "@/lib/types";
import { formatCurrency, formatDate, getInitials, generateId, TIME_UNIT_LABELS, formatDuration, calculateDueDate, type TimeUnit } from "@/lib/utils-crm";

const SOURCE_LABELS: Record<LeadSource, string> = {
  indicacao: "Indicação", site: "Site", redes_sociais: "Redes Sociais",
  email: "Email", evento: "Evento", outros: "Outros",
};

const EMPTY_LEAD: Omit<Lead, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", company: "", status: "novo",
  source: "site", value: 0, responsibleId: "", notes: "", tags: [],
};

const PRESET_COLORS = [
  "#3b82f6","#eab308","#a855f7","#f97316",
  "#22c55e","#ef4444","#06b6d4","#ec4899",
  "#14b8a6","#f59e0b","#8b5cf6","#64748b",
];

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1">{children}</label>;
}
function FormInput({ value, onChange, type = "text", placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400"
    />
  );
}

// ─── Automation Config Panel ─────────────────────────────────────────────────
function AutomationPanel({ stage }: { stage: PipelineStage }) {
  const { automations, isLoading } = useAutomations(stage.id);
  const { users } = useUsers();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleAddWebhook() {
    const created = await createAutomation({ stageId: stage.id, type: "webhook", url: "", active: true });
    setExpanded(created.id);
  }

  async function handleAddTask() {
    const created = await createAutomation({
      stageId: stage.id, type: "task",
      titleTemplate: "Follow-up: {{lead_name}}",
      priority: "media", assigneeId: "", dueValue: 1, dueUnit: "dias", active: true,
    });
    setExpanded(created.id);
  }

  async function handleRemove(a: AutomationRecord) {
    await deleteAutomation(a.id, stage.id);
    setExpanded(null);
  }

  async function handleUpdate(a: AutomationRecord, data: Partial<AutomationRecord>) {
    await updateAutomation(a.id, stage.id, data);
  }

  const webhookCount = automations.filter((a) => a.type === "webhook").length;
  const taskCount = automations.filter((a) => a.type === "task").length;

  return (
    <div className="space-y-3">
      {/* Resumo da etapa */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
        <span className="text-sm font-bold text-gray-800">{stage.label}</span>
        {(webhookCount + taskCount) > 0 && (
          <span className="text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-300 font-bold px-1.5 py-0.5 rounded-full">
            {webhookCount + taskCount} gatilho{webhookCount + taskCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Botões adicionar */}
      <div className="flex gap-2">
        <button onClick={handleAddWebhook}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border-2 border-dashed border-blue-200 text-blue-500 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all">
          <Webhook size={12} /> + Webhook
        </button>
        <button onClick={handleAddTask}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border-2 border-dashed border-purple-200 text-purple-500 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all">
          <ListTodo size={12} /> + Criar Tarefa
        </button>
      </div>

      {/* Lista de gatilhos */}
      {isLoading && <p className="text-xs text-gray-400 text-center py-2">Carregando...</p>}
      {!isLoading && automations.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">Nenhum gatilho configurado para esta etapa.</p>
      )}
      {automations.map((automation) => (
        <div key={automation.id} className={cn(
          "border rounded-xl overflow-hidden transition-all",
          automation.type === "webhook" ? "border-blue-200 bg-blue-50/50" : "border-purple-200 bg-purple-50/50"
        )}>
          {/* Header do gatilho */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className={cn("p-1 rounded-md", automation.type === "webhook" ? "bg-blue-100" : "bg-purple-100")}>
              {automation.type === "webhook" ? <Webhook size={11} className="text-blue-600" /> : <ListTodo size={11} className="text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">{automation.type === "webhook" ? "Disparar Webhook" : "Criar Tarefa"}</p>
              <p className="text-[10px] text-gray-400 truncate">
                {automation.type === "webhook"
                  ? (automation.url || "URL não configurada")
                  : `"${automation.titleTemplate}" · +${formatDuration(automation.dueValue, automation.dueUnit as TimeUnit)}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                title={automation.active ? "Desativar" : "Ativar"}
                onClick={() => handleUpdate(automation, { active: !automation.active })}
                className={cn("w-8 h-4 rounded-full transition-colors relative", automation.active ? "bg-green-400" : "bg-gray-200")}>
                <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all", automation.active ? "left-[18px]" : "left-0.5")} />
              </button>
              <button onClick={() => setExpanded(expanded === automation.id ? null : automation.id)} className="p-1 hover:bg-white rounded-md text-gray-400">
                {expanded === automation.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button onClick={() => handleRemove(automation)} className="p-1 hover:bg-red-100 rounded-md text-gray-400 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Corpo expandido */}
          {expanded === automation.id && (
            <div className="border-t border-inherit px-3 pb-3 pt-2.5 space-y-3 bg-white/60">
              {automation.type === "webhook" && (
                <>
                  <div>
                    <FormLabel>URL do Webhook</FormLabel>
                    <input type="url" value={automation.url ?? ""}
                      onChange={(e) => handleUpdate(automation, { url: e.target.value })}
                      placeholder="https://hooks.zapier.com/..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 font-mono" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye size={10} className="text-gray-400" />
                      <FormLabel>Payload enviado (POST JSON)</FormLabel>
                    </div>
                    <pre className="text-[10px] bg-gray-900 text-green-400 rounded-lg p-2.5 overflow-x-auto leading-relaxed font-mono">{`{
  "event": "lead_stage_changed",
  "stage_id": "${stage.id}",
  "stage_label": "${stage.label}",
  "lead": {
    "id": "...", "name": "...", "email": "...",
    "phone": "...", "company": "...",
    "value": 0, "source": "...",
    "tags": [], "notes": "...",
    "next_follow_up": "..."
  },
  "client": {
    "cnpj": "...", "trade_name": "...",
    "state_registration": "...",
    "municipal_registration": "...",
    "tax_regime": "...", "legal_nature": "...",
    "founding_date": "..."
  },
  "timestamp": "2025-01-01T00:00:00Z"
}`}</pre>
                  </div>
                </>
              )}
              {automation.type === "task" && (
                <>
                  <div>
                    <FormLabel>Título da tarefa</FormLabel>
                    <input value={automation.titleTemplate ?? ""}
                      onChange={(e) => handleUpdate(automation, { titleTemplate: e.target.value })}
                      placeholder="Follow-up: {{lead_name}}"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Variáveis: <code className="bg-gray-100 px-1 rounded">{"{{lead_name}}"}</code>{" "}
                      <code className="bg-gray-100 px-1 rounded">{"{{company}}"}</code>{" "}
                      <code className="bg-gray-100 px-1 rounded">{"{{stage}}"}</code>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <FormLabel>Prazo (valor)</FormLabel>
                      <input type="number" min={0} max={9999} value={automation.dueValue ?? 1}
                        onChange={(e) => handleUpdate(automation, { dueValue: Number(e.target.value) })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                    </div>
                    <div>
                      <FormLabel>Unidade de tempo</FormLabel>
                      <select value={automation.dueUnit ?? "dias"}
                        onChange={(e) => handleUpdate(automation, { dueUnit: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 bg-white">
                        <option value="segundos">Segundo(s)</option>
                        <option value="minutos">Minuto(s)</option>
                        <option value="horas">Hora(s)</option>
                        <option value="dias">Dia(s)</option>
                        <option value="meses">Mês(es)</option>
                      </select>
                    </div>
                    <div>
                      <FormLabel>Prioridade</FormLabel>
                      <select value={automation.priority ?? "media"}
                        onChange={(e) => handleUpdate(automation, { priority: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 bg-white">
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <FormLabel>Responsável</FormLabel>
                    <select value={automation.assigneeId ?? ""}
                      onChange={(e) => handleUpdate(automation, { assigneeId: e.target.value })}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 bg-white">
                      <option value="">Mesmo responsável do lead</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Pipeline Config Modal ────────────────────────────────────────────────────
function PipelineConfigModal({ onClose, defaultTab = "stages" }: { onClose: () => void; defaultTab?: "stages" | "automations" }) {
  const { stages, setStages } = usePipelineStore();
  const [tab, setTab] = useState<"stages" | "automations">(defaultTab);
  const [localStages, setLocalStages] = useState<PipelineStage[]>(() => {
    const seen = new Set<string>();
    return [...stages]
      .filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; })
      .sort((a, b) => a.order - b.order);
  });
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string>(stages[0]?.id ?? "");
  const dragStage = useRef<string | null>(null);
  const dragOverStage = useRef<string | null>(null);

  function handleAdd() {
    if (!newLabel.trim()) return;
    const newStage: PipelineStage = {
      id: generateId("stage"),
      label: newLabel.trim(),
      color: newColor,
      order: localStages.length,
    };
    const updated = [...localStages, newStage];
    setLocalStages(updated);
    setNewLabel("");
    setNewColor("#6366f1");
  }

  function handleDelete(id: string) {
    setLocalStages((prev) => prev.filter((s) => s.id !== id));
  }

  function startEdit(stage: PipelineStage) {
    setEditingId(stage.id);
    setEditLabel(stage.label);
    setEditColor(stage.color);
  }

  function confirmEdit(id: string) {
    setLocalStages((prev) =>
      prev.map((s) => s.id === id ? { ...s, label: editLabel, color: editColor } : s)
    );
    setEditingId(null);
  }

  function onDragStart(id: string) { dragStage.current = id; }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    dragOverStage.current = id;
  }
  function onDrop() {
    if (!dragStage.current || !dragOverStage.current || dragStage.current === dragOverStage.current) return;
    const from = localStages.findIndex((s) => s.id === dragStage.current);
    const to = localStages.findIndex((s) => s.id === dragOverStage.current);
    const reordered = [...localStages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setLocalStages(reordered.map((s, i) => ({ ...s, order: i })));
    dragStage.current = null;
    dragOverStage.current = null;
  }

  function handleSave() {
    setStages(localStages.map((s, i) => ({ ...s, order: i })));
    onClose();
  }

  const selectedStage = localStages.find((s) => s.id === selectedStageId) ?? localStages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-black flex-shrink-0">
          <div>
            <h3 className="font-bold text-white">Configurar Pipeline</h3>
            <p className="text-xs text-white/50 mt-0.5">Etapas, ordem e gatilhos de automação</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setTab("stages")}
            className={cn(
              "flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors",
              tab === "stages" ? "bg-white text-gray-900 border-b-2 border-yellow-400" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <GripVertical size={13} /> Etapas
          </button>
          <button
            onClick={() => setTab("automations")}
            className={cn(
              "flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors",
              tab === "automations" ? "bg-white text-gray-900 border-b-2 border-yellow-400" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Zap size={13} /> Gatilhos
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* ── TAB: Etapas ── */}
          {tab === "stages" && (
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                {localStages.map((stage) => (
                  <div
                    key={stage.id}
                    draggable
                    onDragStart={() => onDragStart(stage.id)}
                    onDragOver={(e) => onDragOver(e, stage.id)}
                    onDrop={onDrop}
                    className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 group"
                  >
                    <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                    <div className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ backgroundColor: stage.color }} />
                    {editingId === stage.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          autoFocus value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && confirmEdit(stage.id)}
                          className="flex-1 text-sm border border-yellow-400 rounded-lg px-2 py-1 focus:outline-none"
                        />
                        <div className="flex gap-1">
                          {PRESET_COLORS.slice(0, 6).map((c) => (
                            <button key={c} onClick={() => setEditColor(c)}
                              className={cn("w-4 h-4 rounded-full border-2 transition-transform", editColor === c ? "border-black scale-110" : "border-transparent")}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <button onClick={() => confirmEdit(stage.id)} className="p-1 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300">
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 text-sm font-medium text-gray-800">{stage.label}</span>
                    )}
                    {editingId !== stage.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(stage)} className="p-1 rounded hover:bg-white text-gray-400 hover:text-gray-700">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDelete(stage.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {localStages.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-400">Nenhuma etapa. Adicione abaixo.</div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Nova Etapa</p>
                <FormLabel>Nome da etapa</FormLabel>
                <FormInput value={newLabel} onChange={setNewLabel} placeholder="ex: Qualificação" />
                <div className="mt-2">
                  <FormLabel>Cor</FormLabel>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setNewColor(c)}
                        className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", newColor === c ? "border-black scale-110" : "border-transparent")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleAdd} disabled={!newLabel.trim()}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-bold border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> Adicionar Etapa
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: Gatilhos ── */}
          {tab === "automations" && (
            <div className="flex h-full" style={{ minHeight: 340 }}>
              {/* Sidebar de etapas */}
              <div className="w-40 border-r border-gray-100 bg-gray-50 flex-shrink-0 py-2">
                {localStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors",
                      selectedStageId === stage.id ? "bg-white border-r-2 border-yellow-400 text-gray-900" : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold truncate">{stage.label}</span>
                  </button>
                ))}
                {localStages.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-4">Nenhuma etapa</p>
                )}
              </div>
              {/* Painel de gatilhos */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedStage ? (
                  <AutomationPanel stage={selectedStage} />
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">Selecione uma etapa</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition-colors">
            Salvar Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CRMPage() {
  const { leads } = useLeads();
  const { users } = useUsers();
  const { stages } = usePipelineStore();
  const { automations: allAutomations } = useAutomations(); // todos os gatilhos do banco
  const { currentUser } = useAuthStore();

  const seen = new Set<string>();
  const sortedStages = [...stages]
    .filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; })
    .sort((a, b) => a.order - b.order);

  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [modalLead, setModalLead] = useState<Partial<Lead> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<"stages" | "automations">("stages");
  const dragItem = useRef<string | null>(null);

  const filtered = leads.filter((l) =>
    search === "" ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStageLeads = (stageId: string) => filtered.filter((l) => l.status === stageId);

  // Executa gatilhos ao mover lead de etapa
  async function executeAutomations(lead: Lead, stageId: string) {
    // Busca os gatilhos ativos deste stage diretamente do banco
    const stageAutomations = allAutomations.filter((a) => a.stageId === stageId && a.active);
    if (stageAutomations.length === 0) return;

    const stage = stages.find((s) => s.id === stageId);
    const stageLabel = stage?.label ?? stageId;
    const now = new Date();

    // Busca dados fiscais do cliente vinculado ao lead (se houver)
    let clientFiscal: Record<string, string | null> = {};
    if (lead.company) {
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(lead.company)}`);
        if (res.ok) {
          const clients = await res.json();
          const client = clients[0];
          if (client) {
            clientFiscal = {
              cnpj: client.cnpj ?? null,
              trade_name: client.tradeName ?? null,
              state_registration: client.stateRegistration ?? null,
              municipal_registration: client.municipalRegistration ?? null,
              tax_regime: client.taxRegime ?? null,
              legal_nature: client.legalNature ?? null,
              founding_date: client.foundingDate ?? null,
            };
          }
        }
      } catch {/* silently fail */}
    }

    for (const automation of stageAutomations) {
      if (automation.type === "webhook") {
        if (!automation.url) continue;
        const payload = {
          event: "lead_stage_changed",
          stage_id: stageId,
          stage_label: stageLabel,
          lead: {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? "",
            company: lead.company ?? "",
            value: lead.value,
            source: lead.source,
            tags: lead.tags ?? [],
            notes: lead.notes ?? "",
            next_follow_up: lead.nextFollowUp ?? null,
          },
          client: clientFiscal,
          timestamp: now.toISOString(),
        };
        fetch(automation.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {/* silently fail */});
      }

      if (automation.type === "task") {
        const title = (automation.titleTemplate ?? "Follow-up: {{lead_name}}")
          .replace("{{lead_name}}", lead.name)
          .replace("{{company}}", lead.company ?? "")
          .replace("{{stage}}", stageLabel);

        const dueDateFull = calculateDueDate(now.toISOString(), automation.dueValue ?? 1, automation.dueUnit as TimeUnit);
        const dueDateStr = dueDateFull.split("T")[0];

        createTask({
          title,
          description: `Tarefa criada automaticamente ao mover ${lead.name} para "${stageLabel}"`,
          assigneeId: automation.assigneeId || lead.responsibleId || currentUser?.id || "",
          creatorId: currentUser?.id ?? "system",
          status: "a_fazer",
          priority: (automation.priority ?? "media") as Task["priority"],
          dueDate: (automation.dueValue ?? 0) > 0 ? dueDateStr : undefined,
          tags: ["automacao", "crm"],
        });
      }
    }
  }

  const onDragStart = (id: string) => { dragItem.current = id; setDragging(id); };
  const onDragEnd = () => { setDragging(null); setDragOver(null); dragItem.current = null; };
  const onDrop = (stageId: string) => {
    if (dragItem.current) {
      const lead = leads.find((l) => l.id === dragItem.current);
      if (lead && lead.status !== stageId) {
        updateLead(dragItem.current, { status: stageId as Lead["status"] });
        executeAutomations(lead, stageId);
      }
    }
    setDragOver(null); setDragging(null); dragItem.current = null;
  };

  function openAdd(stageId: string) {
    setModalLead({ ...EMPTY_LEAD, status: stageId as Lead["status"] });
    setIsEditing(false);
  }

  function openEdit(lead: Lead) {
    setModalLead({ ...lead });
    setIsEditing(true);
    setDetailLead(null);
  }

  async function saveLead() {
    if (!modalLead?.name) return;
    if (isEditing && modalLead.id) {
      await updateLead(modalLead.id, modalLead);
    } else {
      const payload = {
        name: modalLead.name ?? "",
        email: modalLead.email ?? "",
        phone: modalLead.phone,
        company: modalLead.company,
        status: (modalLead.status as Lead["status"]) ?? "novo",
        source: (modalLead.source as Lead["source"]) ?? "site",
        value: Number(modalLead.value) || 0,
        responsibleId: modalLead.responsibleId ?? currentUser?.id ?? "",
        notes: modalLead.notes,
        tags: modalLead.tags ?? [],
        nextFollowUp: modalLead.nextFollowUp,
      };
      const newLead = await createLead(payload);
      if (newLead?.id) executeAutomations(newLead, newLead.status);
    }
    setModalLead(null);
  }

  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
  const wonLeads = leads.filter((l) => l.status === "ganho");
  const wonValue = wonLeads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Pipeline CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} · {formatCurrency(totalValue)} no pipeline · {formatCurrency(wonValue)} ganhos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lead..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 w-52"
            />
          </div>
          {/* Config com submenu */}
          <div className="relative group">
            <button
              onClick={() => { setConfigTab("stages"); setShowConfig(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:border-yellow-400 transition-colors"
            >
              <Settings2 size={14} /> Pipeline
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 min-w-[160px] hidden group-hover:block">
              <button
                onClick={() => { setConfigTab("stages"); setShowConfig(true); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <GripVertical size={12} /> Etapas
              </button>
              <button
                onClick={() => { setConfigTab("automations"); setShowConfig(true); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Zap size={12} /> Gatilhos
              </button>
            </div>
          </div>
          <button
            onClick={() => openAdd("novo")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={14} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-3 flex-1" style={{ minHeight: 0 }}>
        {sortedStages.map((stage) => {
          const stageLeads = getStageLeads(stage.id);
          const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
          const automationCount = Array.isArray(allAutomations)
            ? allAutomations.filter((a) => a.stageId === stage.id && a.active).length
            : 0;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
              onDrop={() => onDrop(stage.id)}
              onDragLeave={() => setDragOver(null)}
              className={cn(
                "flex-shrink-0 flex flex-col rounded-2xl border-2 transition-colors bg-gray-50 overflow-hidden",
                dragOver === stage.id ? "border-dashed border-yellow-400 bg-yellow-50" : "border-transparent"
              )}
              style={{ width: 272 }}
            >
              {/* Column Header */}
              <div className="px-3 pt-3 pb-2 flex-shrink-0">
                <div className="h-1 rounded-full mb-3" style={{ backgroundColor: stage.color }} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{stage.label}</span>
                    <span className="text-xs bg-white border border-gray-200 text-gray-500 font-bold px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                    {automationCount > 0 && (
                      <button
                        onClick={() => { setConfigTab("automations"); setShowConfig(true); }}
                        title={`${automationCount} gatilho${automationCount !== 1 ? "s" : ""} ativo${automationCount !== 1 ? "s" : ""}`}
                        className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold px-1.5 py-0.5 rounded-full hover:bg-yellow-200 transition-colors"
                      >
                        <Zap size={9} /> {automationCount}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {stageLeads.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">{formatCurrency(stageValue)}</span>
                    )}
                    <button
                      onClick={() => openAdd(stage.id)}
                      className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                {stageLeads.map((lead) => {
                  const responsible = users.find((u) => u.id === lead.responsibleId);
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => onDragStart(lead.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setDetailLead(lead)}
                      className={cn(
                        "bg-white rounded-xl border border-gray-100 p-3 cursor-grab hover:shadow-md hover:border-gray-200 transition-all",
                        dragging === lead.id && "opacity-40 scale-95"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Building2 size={10} /> {lead.company}
                            </p>
                          )}
                        </div>
                        {lead.value > 0 && (
                          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                            {formatCurrency(lead.value)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {lead.email && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Mail size={9} /> {lead.email.split("@")[0]}
                            </span>
                          )}
                          {lead.phone && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Phone size={9} /> {lead.phone.slice(0, 10)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {lead.nextFollowUp && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Calendar size={9} /> {formatDate(lead.nextFollowUp)}
                            </span>
                          )}
                          {responsible && (
                            <div
                              className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"
                              title={responsible.name}
                            >
                              <span className="text-[8px] font-bold text-yellow-400">{getInitials(responsible.name)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {lead.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {stageLeads.length === 0 && (
                  <div
                    className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-300 cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => openAdd(stage.id)}
                  >
                    Solte um lead aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add column button */}
        <button
          onClick={() => { setConfigTab("stages"); setShowConfig(true); }}
          className="flex-shrink-0 w-16 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-300 hover:border-yellow-300 hover:text-yellow-400 transition-colors"
        >
          <Plus size={20} />
          <span className="text-[10px] mt-1 font-bold">Nova</span>
        </button>
      </div>

      {/* Pipeline Config Modal */}
      {showConfig && (
        <PipelineConfigModal onClose={() => setShowConfig(false)} defaultTab={configTab} />
      )}

      {/* Lead Detail Modal */}
      {detailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailLead(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-black">
              <div>
                <h3 className="font-bold text-white">{detailLead.name}</h3>
                <p className="text-xs text-white/50">{detailLead.company ?? "Sem empresa"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(detailLead)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => { deleteLead(detailLead.id); setDetailLead(null); }} className="p-1.5 rounded-lg hover:bg-red-900/30 text-white/60 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
                <button onClick={() => setDetailLead(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: "Email", value: detailLead.email },
                  { icon: Phone, label: "Telefone", value: detailLead.phone ?? "—" },
                  { icon: DollarSign, label: "Valor", value: formatCurrency(detailLead.value) },
                  { icon: Building2, label: "Origem", value: SOURCE_LABELS[detailLead.source] },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-gray-400" />
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {detailLead.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{detailLead.notes}</p>
                </div>
              )}
              {detailLead.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {detailLead.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 text-xs text-gray-400">
                <Calendar size={11} />
                <span>Criado em {formatDate(detailLead.createdAt)}</span>
                {detailLead.nextFollowUp && <span>· Follow-up: {formatDate(detailLead.nextFollowUp)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {modalLead !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalLead(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-black">
              <h3 className="font-bold text-white">{isEditing ? "Editar Lead" : "Novo Lead"}</h3>
              <button onClick={() => setModalLead(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FormLabel>Nome *</FormLabel>
                  <FormInput value={modalLead.name ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, name: v }))} placeholder="Nome do lead" />
                </div>
                <div>
                  <FormLabel>Email</FormLabel>
                  <FormInput type="email" value={modalLead.email ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, email: v }))} placeholder="email@exemplo.com" />
                </div>
                <div>
                  <FormLabel>Telefone</FormLabel>
                  <FormInput value={modalLead.phone ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, phone: v }))} placeholder="(11) 99999-0000" />
                </div>
                <div>
                  <FormLabel>Empresa</FormLabel>
                  <FormInput value={modalLead.company ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, company: v }))} placeholder="Nome da empresa" />
                </div>
                <div>
                  <FormLabel>Valor estimado (R$)</FormLabel>
                  <FormInput type="number" value={String(modalLead.value ?? 0)} onChange={(v) => setModalLead((p) => ({ ...p, value: Number(v) }))} placeholder="0" />
                </div>
                <div>
                  <FormLabel>Etapa</FormLabel>
                  <select
                    value={modalLead.status ?? "novo"}
                    onChange={(e) => setModalLead((p) => ({ ...p, status: e.target.value as Lead["status"] }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {sortedStages.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormLabel>Origem</FormLabel>
                  <select
                    value={modalLead.source ?? "site"}
                    onChange={(e) => setModalLead((p) => ({ ...p, source: e.target.value as Lead["source"] }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormLabel>Responsável</FormLabel>
                  <select
                    value={modalLead.responsibleId ?? ""}
                    onChange={(e) => setModalLead((p) => ({ ...p, responsibleId: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    <option value="">Selecionar</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Próximo follow-up</FormLabel>
                  <FormInput type="date" value={modalLead.nextFollowUp ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, nextFollowUp: v }))} />
                </div>
                <div className="col-span-2">
                  <FormLabel>Tags (separadas por vírgula)</FormLabel>
                  <FormInput
                    value={(modalLead.tags ?? []).join(", ")}
                    onChange={(v) => setModalLead((p) => ({ ...p, tags: v.split(",").map((t) => t.trim()).filter(Boolean) }))}
                    placeholder="tech, b2b, urgente"
                  />
                </div>
                <div className="col-span-2">
                  <FormLabel>Observações</FormLabel>
                  <textarea
                    value={modalLead.notes ?? ""}
                    onChange={(e) => setModalLead((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Anotações sobre o lead..."
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModalLead(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveLead}
                disabled={!modalLead.name}
                className="px-5 py-2 text-sm font-bold bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEditing ? "Salvar" : "Adicionar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
