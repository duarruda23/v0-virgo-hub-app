"use client";
import { useState, useRef } from "react";
import {
  Plus, X, Phone, Mail, Building2, DollarSign, Calendar,
  Pencil, Trash2, Search, Settings2, GripVertical, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRMStore, useUsersStore, usePipelineStore } from "@/lib/store";
import type { PipelineStage } from "@/lib/store";
import type { Lead, LeadSource } from "@/lib/types";
import { formatCurrency, formatDate, getInitials, generateId } from "@/lib/utils-crm";

const SOURCE_LABELS: Record<LeadSource, string> = {
  indicacao: "Indicação", site: "Site", redes_sociais: "Redes Sociais",
  email: "Email", evento: "Evento", outros: "Outros",
};

const EMPTY_LEAD: Omit<Lead, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", company: "", status: "novo",
  source: "site", value: 0, responsibleId: "", notes: "", tags: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Pipeline Config Modal ────────────────────────────────────────────────────
function PipelineConfigModal({ onClose }: { onClose: () => void }) {
  const { stages, addStage, updateStage, deleteStage, reorderStages } = usePipelineStore();
  const [localStages, setLocalStages] = useState<PipelineStage[]>(
    [...stages].sort((a, b) => a.order - b.order)
  );
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const dragStage = useRef<string | null>(null);
  const dragOverStage = useRef<string | null>(null);

  const PRESET_COLORS = [
    "#3b82f6", "#eab308", "#a855f7", "#f97316",
    "#22c55e", "#ef4444", "#06b6d4", "#ec4899",
    "#14b8a6", "#f59e0b", "#8b5cf6", "#64748b",
  ];

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

  // Drag reorder
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
    const withOrder = localStages.map((s, i) => ({ ...s, order: i }));
    reorderStages(withOrder);
    // sync individual changes
    withOrder.forEach((s) => {
      const exists = stages.find((st) => st.id === s.id);
      if (!exists) addStage(s);
      else updateStage(s.id, s);
    });
    stages.forEach((s) => {
      if (!withOrder.find((ws) => ws.id === s.id)) deleteStage(s.id);
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-black">
          <div>
            <h3 className="font-bold text-white">Configurar Pipeline</h3>
            <p className="text-xs text-white/50 mt-0.5">Arraste para reordenar, renomeie ou exclua etapas</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Stages list */}
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
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmEdit(stage.id)}
                      className="flex-1 text-sm border border-yellow-400 rounded-lg px-2 py-1 focus:outline-none"
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
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

          {/* Add new */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Nova Etapa</p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormLabel>Nome da etapa</FormLabel>
                <FormInput
                  value={newLabel}
                  onChange={setNewLabel}
                  placeholder="ex: Qualificação"
                />
              </div>
            </div>
            <div className="mt-2">
              <FormLabel>Cor</FormLabel>
              <div className="flex gap-2 flex-wrap mt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", newColor === c ? "border-black scale-110" : "border-transparent")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-bold border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} /> Adicionar Etapa
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
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
  const { leads, addLead, updateLead, deleteLead, moveLeadStatus } = useCRMStore();
  const { users } = useUsersStore();
  const { stages } = usePipelineStore();

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [modalLead, setModalLead] = useState<Partial<Lead> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const dragItem = useRef<string | null>(null);

  const filtered = leads.filter((l) =>
    search === "" ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStageLeads = (stageId: string) => filtered.filter((l) => l.status === stageId);

  const onDragStart = (id: string) => { dragItem.current = id; setDragging(id); };
  const onDragEnd = () => { setDragging(null); setDragOver(null); dragItem.current = null; };
  const onDrop = (stageId: string) => {
    if (dragItem.current) moveLeadStatus(dragItem.current, stageId as Lead["status"]);
    setDragOver(null); setDragging(null); dragItem.current = null;
  };

  const handleSave = () => {
    if (!modalLead?.name || !modalLead?.email) return;
    const now = new Date().toISOString();
    if (isEditing && modalLead.id) {
      updateLead(modalLead.id, modalLead);
    } else {
      addLead({
        ...EMPTY_LEAD,
        ...modalLead,
        id: generateId("l"),
        status: (modalLead.status ?? sortedStages[0]?.id ?? "novo") as Lead["status"],
        responsibleId: modalLead.responsibleId || users[0]?.id || "",
        createdAt: now,
        updatedAt: now,
      } as Lead);
    }
    setModalLead(null);
    setIsEditing(false);
  };

  const openEdit = (lead: Lead) => { setModalLead({ ...lead }); setIsEditing(true); setDetailLead(null); };
  const openNew = (stageId?: string) => {
    setModalLead({ ...EMPTY_LEAD, status: (stageId ?? sortedStages[0]?.id ?? "novo") as Lead["status"] });
    setIsEditing(false);
  };

  const totalPipeline = leads.filter((l) => {
    const stage = sortedStages.find((s) => s.id === l.status);
    const isWonOrLost = stage?.id === "ganho" || stage?.id === "perdido";
    return !isWonOrLost;
  }).reduce((s, l) => s + l.value, 0);

  const wonValue = leads.filter((l) => l.status === "ganho").reduce((s, l) => s + l.value, 0);

  return (
    <div className="flex flex-col h-full gap-4 -m-6 p-6 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      {showConfig && <PipelineConfigModal onClose={() => setShowConfig(false)} />}

      {/* Topbar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-full focus:outline-none focus:border-yellow-400"
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-gray-500">Pipeline:</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalPipeline)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-500">Ganhos:</span>
              <span className="font-bold text-gray-900">{formatCurrency(wonValue)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Settings2 size={15} /> Pipeline
          </button>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-2 flex-1 min-h-0">
        {sortedStages.map((stage) => {
          const stageLeads = getStageLeads(stage.id);
          const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
          const isOver = dragOver === stage.id;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex flex-col flex-shrink-0 w-64 rounded-xl border border-gray-200 bg-gray-50 transition-colors",
                isOver && "bg-yellow-50 border-yellow-300"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => onDrop(stage.id)}
            >
              {/* Column header */}
              <div className="px-3 pt-3 pb-2 rounded-t-xl border-t-4" style={{ borderTopColor: stage.color }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide truncate">{stage.label}</span>
                  <span className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded-full font-bold text-gray-500 flex-shrink-0 ml-1">{stageLeads.length}</span>
                </div>
                {stageValue > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(stageValue)}</p>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 min-h-[80px]">
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
                        "bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-gray-300 transition-all select-none",
                        dragging === lead.id && "opacity-40 scale-95"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.name}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(lead); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <Pencil size={11} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {lead.company && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <Building2 size={10} className="text-gray-400" />
                          <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(lead.value)}</p>
                        {responsible && (
                          <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center" title={responsible.name}>
                            <span className="text-[8px] font-bold text-yellow-400">{getInitials(responsible.name)}</span>
                          </div>
                        )}
                      </div>

                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                          <Calendar size={9} className="text-gray-400" />
                          <span className="text-[10px] text-gray-400">Follow-up {formatDate(lead.nextFollowUp)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add button */}
              <button
                onClick={() => openNew(stage.id)}
                className="mx-2 mb-2 p-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-white border border-dashed border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
          );
        })}

        {/* Add stage shortcut */}
        <button
          onClick={() => setShowConfig(true)}
          className="flex-shrink-0 w-48 h-32 self-start rounded-xl border-2 border-dashed border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-yellow-600"
        >
          <Plus size={20} />
          <span className="text-xs font-semibold">Nova Coluna</span>
        </button>
      </div>

      {/* Lead Detail Panel */}
      {detailLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetailLead(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{detailLead.name}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(detailLead)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Pencil size={15} /></button>
                <button onClick={() => setDetailLead(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={15} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Stage badge */}
              <div className="flex items-center gap-2">
                {(() => {
                  const s = sortedStages.find((st) => st.id === detailLead.status);
                  return s ? (
                    <span className="text-xs px-2.5 py-1 rounded-full border font-semibold text-white" style={{ backgroundColor: s.color, borderColor: s.color }}>
                      {s.label}
                    </span>
                  ) : null;
                })()}
                <span className="text-xs text-gray-400">{SOURCE_LABELS[detailLead.source]}</span>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
                <DollarSign size={20} className="text-yellow-600" />
                <div>
                  <p className="text-xs text-yellow-700 font-medium">Valor Potencial</p>
                  <p className="text-xl font-black text-gray-900">{formatCurrency(detailLead.value)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contato</p>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400" /> {detailLead.email}</div>
                {detailLead.phone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" /> {detailLead.phone}</div>}
                {detailLead.company && <div className="flex items-center gap-2 text-sm text-gray-700"><Building2 size={14} className="text-gray-400" /> {detailLead.company}</div>}
              </div>

              {detailLead.notes && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Observações</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{detailLead.notes}</p>
                </div>
              )}

              {detailLead.nextFollowUp && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-3">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="text-blue-700 font-medium">Follow-up: {formatDate(detailLead.nextFollowUp)}</span>
                </div>
              )}

              {/* Move stage */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mover Etapa</p>
                <div className="flex flex-wrap gap-2">
                  {sortedStages.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { moveLeadStatus(detailLead.id, s.id as Lead["status"]); setDetailLead({ ...detailLead, status: s.id as Lead["status"] }); }}
                      className={cn(
                        "text-xs py-1.5 px-3 rounded-lg border font-semibold transition-all",
                        detailLead.status === s.id ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      )}
                      style={detailLead.status === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Criado em {formatDate(detailLead.createdAt)} · Atualizado {formatDate(detailLead.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalLead !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalLead(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Lead" : "Novo Lead"}</h3>
              <button onClick={() => setModalLead(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FormLabel>Nome *</FormLabel>
                  <FormInput value={modalLead.name ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, name: v }))} placeholder="Nome completo" />
                </div>
                <div>
                  <FormLabel>Email *</FormLabel>
                  <FormInput value={modalLead.email ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, email: v }))} placeholder="email@empresa.com" />
                </div>
                <div>
                  <FormLabel>Telefone</FormLabel>
                  <FormInput value={modalLead.phone ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, phone: v }))} placeholder="(11) 9..." />
                </div>
                <div>
                  <FormLabel>Empresa</FormLabel>
                  <FormInput value={modalLead.company ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, company: v }))} placeholder="Nome da empresa" />
                </div>
                <div>
                  <FormLabel>Valor</FormLabel>
                  <FormInput value={String(modalLead.value ?? 0)} onChange={(v) => setModalLead((p) => ({ ...p, value: Number(v) }))} type="number" placeholder="0" />
                </div>
                <div>
                  <FormLabel>Etapa</FormLabel>
                  <select
                    value={modalLead.status ?? sortedStages[0]?.id ?? "novo"}
                    onChange={(e) => setModalLead((p) => ({ ...p, status: e.target.value as Lead["status"] }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {sortedStages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Origem</FormLabel>
                  <select
                    value={modalLead.source ?? "site"}
                    onChange={(e) => setModalLead((p) => ({ ...p, source: e.target.value as LeadSource }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Responsável</FormLabel>
                  <select
                    value={modalLead.responsibleId ?? users[0]?.id ?? ""}
                    onChange={(e) => setModalLead((p) => ({ ...p, responsibleId: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {users.length === 0 && <option value="">Nenhum usuário</option>}
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Follow-up</FormLabel>
                  <FormInput value={modalLead.nextFollowUp ?? ""} onChange={(v) => setModalLead((p) => ({ ...p, nextFollowUp: v }))} type="date" />
                </div>
                <div className="col-span-2">
                  <FormLabel>Observações</FormLabel>
                  <textarea
                    value={modalLead.notes ?? ""}
                    onChange={(e) => setModalLead((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none"
                    placeholder="Notas sobre o lead..."
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModalLead(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!modalLead.name || !modalLead.email}
                className="px-5 py-2 text-sm font-bold bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEditing ? "Salvar" : "Criar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
