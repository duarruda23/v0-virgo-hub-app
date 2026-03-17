"use client";
import { useState, useRef } from "react";
import { Plus, X, Phone, Mail, Building2, DollarSign, Calendar, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRMStore, useUsersStore } from "@/lib/store";
import type { Lead, LeadStatus, LeadSource } from "@/lib/types";
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  formatCurrency, formatDate, getInitials, generateId
} from "@/lib/utils-crm";

const STAGES: LeadStatus[] = ["novo", "em_contato", "proposta", "negociacao", "ganho", "perdido"];

const STAGE_COLORS: Record<LeadStatus, string> = {
  novo: "border-t-blue-400",
  em_contato: "border-t-yellow-400",
  proposta: "border-t-purple-400",
  negociacao: "border-t-orange-400",
  ganho: "border-t-green-500",
  perdido: "border-t-red-400",
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  indicacao: "Indicação",
  site: "Site",
  redes_sociais: "Redes Sociais",
  email: "Email",
  evento: "Evento",
  outros: "Outros",
};

const EMPTY_LEAD: Omit<Lead, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", company: "", status: "novo",
  source: "site", value: 0, responsibleId: "u1", notes: "", tags: [],
};

export default function CRMPage() {
  const { leads, addLead, updateLead, deleteLead, moveLeadStatus } = useCRMStore();
  const { users } = useUsersStore();

  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [modalLead, setModalLead] = useState<Partial<Lead> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const dragItem = useRef<string | null>(null);

  const filtered = leads.filter((l) =>
    search === "" ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStageLeads = (status: LeadStatus) => filtered.filter((l) => l.status === status);

  // Drag handlers
  const onDragStart = (id: string) => { dragItem.current = id; setDragging(id); };
  const onDragEnd = () => { setDragging(null); setDragOver(null); dragItem.current = null; };
  const onDrop = (status: LeadStatus) => {
    if (dragItem.current) moveLeadStatus(dragItem.current, status);
    setDragOver(null);
    setDragging(null);
    dragItem.current = null;
  };

  const handleSave = () => {
    if (!modalLead?.name || !modalLead?.email) return;
    if (isEditing && modalLead.id) {
      updateLead(modalLead.id, modalLead);
    } else {
      addLead({ ...EMPTY_LEAD, ...modalLead, id: generateId("l"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Lead);
    }
    setModalLead(null);
    setIsEditing(false);
  };

  const openEdit = (lead: Lead) => { setModalLead({ ...lead }); setIsEditing(true); setDetailLead(null); };
  const openNew = () => { setModalLead({ ...EMPTY_LEAD }); setIsEditing(false); };

  const totalPipeline = leads.filter((l) => l.status !== "perdido" && l.status !== "ganho").reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter((l) => l.status === "ganho").reduce((s, l) => s + l.value, 0);

  return (
    <div className="flex flex-col h-full gap-4 -m-6 p-6 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
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
        <div className="flex items-center gap-4 ml-auto">
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
            onClick={openNew}
            className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-2 flex-1 min-h-0">
        {STAGES.map((stage) => {
          const stageLeads = getStageLeads(stage);
          const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
          const isOver = dragOver === stage;
          return (
            <div
              key={stage}
              className={cn(
                "flex flex-col flex-shrink-0 w-64 rounded-xl border border-gray-200 bg-gray-50 transition-colors",
                isOver && "bg-yellow-50 border-yellow-300"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => onDrop(stage)}
            >
              {/* Column header */}
              <div className={cn("px-3 pt-3 pb-2 border-t-4 rounded-t-xl", STAGE_COLORS[stage])}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{LEAD_STATUS_LABELS[stage]}</span>
                  <span className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded-full font-bold text-gray-500">{stageLeads.length}</span>
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
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(lead); }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                          >
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
                onClick={() => { setModalLead({ ...EMPTY_LEAD, status: stage }); setIsEditing(false); }}
                className="mx-2 mb-2 p-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-white border border-dashed border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Side Panel */}
      {detailLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetailLead(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{detailLead.name}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(detailLead)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDetailLead(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Stage */}
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-semibold", LEAD_STATUS_COLORS[detailLead.status])}>
                  {LEAD_STATUS_LABELS[detailLead.status]}
                </span>
                <span className="text-xs text-gray-400">{SOURCE_LABELS[detailLead.source]}</span>
              </div>

              {/* Value */}
              <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
                <DollarSign size={20} className="text-yellow-600" />
                <div>
                  <p className="text-xs text-yellow-700 font-medium">Valor Potencial</p>
                  <p className="text-xl font-black text-gray-900">{formatCurrency(detailLead.value)}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contato</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={14} className="text-gray-400" /> {detailLead.email}
                </div>
                {detailLead.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400" /> {detailLead.phone}
                  </div>
                )}
                {detailLead.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Building2 size={14} className="text-gray-400" /> {detailLead.company}
                  </div>
                )}
              </div>

              {/* Notes */}
              {detailLead.notes && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Observações</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{detailLead.notes}</p>
                </div>
              )}

              {/* Follow-up */}
              {detailLead.nextFollowUp && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-3">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="text-blue-700 font-medium">Follow-up: {formatDate(detailLead.nextFollowUp)}</span>
                </div>
              )}

              {/* Move Stage */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mover Etapa</p>
                <div className="grid grid-cols-3 gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { moveLeadStatus(detailLead.id, s); setDetailLead({ ...detailLead, status: s }); }}
                      className={cn(
                        "text-xs py-2 px-2 rounded-lg border font-semibold transition-all",
                        detailLead.status === s
                          ? "bg-black text-yellow-400 border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {LEAD_STATUS_LABELS[s]}
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
              <button onClick={() => setModalLead(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
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
                    value={modalLead.status ?? "novo"}
                    onChange={(e) => setModalLead((p) => ({ ...p, status: e.target.value as LeadStatus }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
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
                    value={modalLead.responsibleId ?? "u1"}
                    onChange={(e) => setModalLead((p) => ({ ...p, responsibleId: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
                  >
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
                className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isEditing ? "Salvar Alterações" : "Criar Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>;
}
function FormInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors"
    />
  );
}
