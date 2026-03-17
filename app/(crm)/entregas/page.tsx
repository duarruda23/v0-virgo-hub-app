"use client";
import { useState, useMemo } from "react";
import { ClientOnly } from "@/components/crm/ClientOnly";
import { Plus, X, Search, Calendar, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeliveriesStore, useProjectsStore, useUsersStore } from "@/lib/store";
import type { Delivery, DeliveryStatus, DeliveryType } from "@/lib/types";
import {
  DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS,
  formatDate, getInitials, generateId
} from "@/lib/utils-crm";

const TYPE_LABELS: Record<DeliveryType, string> = {
  post_feed: "Post Feed", post_stories: "Stories", reels: "Reels",
  video: "Vídeo", banner: "Banner", copy: "Copy",
  relatorio: "Relatório", landing_page: "Landing Page", outro: "Outro",
};

const ALL_STATUSES: DeliveryStatus[] = ["pendente", "em_producao", "em_revisao", "aprovado", "entregue", "cancelado"];

const EMPTY: Omit<Delivery, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", projectId: "p1", type: "post_feed",
  status: "pendente", responsibleId: "u1",
  dueDate: new Date().toISOString().split("T")[0],
};

export default function EntregasPage() {
  const { deliveries, addDelivery, updateDelivery, deleteDelivery } = useDeliveriesStore();
  const { projects } = useProjectsStore();
  const { users } = useUsersStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "todos">("todos");
  const [modal, setModal] = useState<Partial<Delivery> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState<"kanban" | "table">("kanban");

  const filtered = useMemo(() => {
    let list = [...deliveries];
    if (search) list = list.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "todos") list = list.filter((d) => d.status === statusFilter);
    return list;
  }, [deliveries, search, statusFilter]);

  const getByStatus = (s: DeliveryStatus) => filtered.filter((d) => d.status === s);

  const handleSave = () => {
    if (!modal?.title) return;
    if (isEditing && modal.id) {
      updateDelivery(modal.id, modal);
    } else {
      addDelivery({ ...EMPTY, ...modal, id: generateId("d"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Delivery);
    }
    setModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar entrega..." className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-full focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView("kanban")} className={cn("px-3 py-2 text-xs font-semibold", view === "kanban" ? "bg-black text-yellow-400" : "bg-white text-gray-500 hover:bg-gray-50")}>Kanban</button>
          <button onClick={() => setView("table")} className={cn("px-3 py-2 text-xs font-semibold", view === "table" ? "bg-black text-yellow-400" : "bg-white text-gray-500 hover:bg-gray-50")}>Tabela</button>
        </div>
        <button onClick={() => { setModal({ ...EMPTY }); setIsEditing(false); }} className="ml-auto flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
          <Plus size={15} /> Nova Entrega
        </button>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <ClientOnly>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ minHeight: "400px" }}>
          {ALL_STATUSES.filter((s) => s !== "cancelado").map((status) => {
            const cards = getByStatus(status);
            return (
              <div key={status} className="flex-shrink-0 w-56 flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{DELIVERY_STATUS_LABELS[status]}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center font-bold">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((d) => {
                    const project = projects.find((p) => p.id === d.projectId);
                    const responsible = users.find((u) => u.id === d.responsibleId);
                    const isLate = d.status !== "entregue" && new Date(d.dueDate) < new Date();
                    return (
                      <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <p className="text-xs font-semibold text-gray-900 leading-tight">{d.title}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setModal({ ...d }); setIsEditing(true); }} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={10} /></button>
                            <button onClick={() => deleteDelivery(d.id)} className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={10} /></button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-2">{TYPE_LABELS[d.type]}</p>
                        {project && <p className="text-[10px] text-gray-500 truncate bg-gray-50 rounded px-1.5 py-0.5 mb-2">{project.name}</p>}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar suppressHydrationWarning size={9} className={cn(isLate ? "text-red-500" : "text-gray-400")} />
                            <span suppressHydrationWarning className={cn("text-[10px]", isLate ? "text-red-500 font-bold" : "text-gray-400")}>{formatDate(d.dueDate)}</span>
                          </div>
                          {responsible && (
                            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center" title={responsible.name}>
                              <span className="text-[7px] font-bold text-yellow-400">{getInitials(responsible.name)}</span>
                            </div>
                          )}
                        </div>
                        {/* Change status buttons */}
                        <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100 flex-wrap">
                          {ALL_STATUSES.filter((s) => s !== status && s !== "cancelado").map((s) => (
                            <button key={s} onClick={() => updateDelivery(d.id, { status: s })} className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors">
                              {DELIVERY_STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </ClientOnly>
      )}

      {/* Table View */}
      {view === "table" && (
        <ClientOnly>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Entrega</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Projeto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Responsável</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => {
                const project = projects.find((p) => p.id === d.projectId);
                const responsible = users.find((u) => u.id === d.responsibleId);
                const isLate = d.status !== "entregue" && d.status !== "cancelado" && new Date(d.dueDate) < new Date();
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{d.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{TYPE_LABELS[d.type]}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{project?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        onChange={(e) => updateDelivery(d.id, { status: e.target.value as DeliveryStatus })}
                        onClick={(e) => e.stopPropagation()}
                        className={cn("text-xs px-2 py-0.5 rounded-full border font-medium cursor-pointer bg-transparent focus:outline-none", DELIVERY_STATUS_COLORS[d.status])}
                      >
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{DELIVERY_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs"><span suppressHydrationWarning className={cn(isLate ? "text-red-500 font-bold" : "text-gray-400")}>{formatDate(d.dueDate)}</span></td>
                    <td className="px-4 py-3">
                      {responsible && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center"><span className="text-[8px] font-bold text-yellow-400">{getInitials(responsible.name)}</span></div>
                          <span className="text-xs text-gray-500 hidden lg:block">{responsible.name.split(" ")[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setModal({ ...d }); setIsEditing(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={13} /></button>
                        <button onClick={() => deleteDelivery(d.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">Nenhuma entrega encontrada</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Entrega" : "Nova Entrega"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div><FormLabel>Título *</FormLabel><FormInput value={modal.title ?? ""} onChange={(v) => setModal((p) => ({ ...p, title: v }))} /></div>
              <div><FormLabel>Descrição</FormLabel><textarea value={modal.description ?? ""} onChange={(e) => setModal((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Projeto</FormLabel>
                  <select value={modal.projectId ?? "p1"} onChange={(e) => setModal((p) => ({ ...p, projectId: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Tipo</FormLabel>
                  <select value={modal.type ?? "post_feed"} onChange={(e) => setModal((p) => ({ ...p, type: e.target.value as DeliveryType }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(Object.keys(TYPE_LABELS) as DeliveryType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Status</FormLabel>
                  <select value={modal.status ?? "pendente"} onChange={(e) => setModal((p) => ({ ...p, status: e.target.value as DeliveryStatus }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{DELIVERY_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Responsável</FormLabel>
                  <select value={modal.responsibleId ?? "u1"} onChange={(e) => setModal((p) => ({ ...p, responsibleId: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div><FormLabel>Prazo</FormLabel><FormInput value={modal.dueDate ?? ""} onChange={(v) => setModal((p) => ({ ...p, dueDate: v }))} type="date" /></div>
                {modal.status === "entregue" && <div><FormLabel>Data Entrega</FormLabel><FormInput value={modal.deliveredAt ?? ""} onChange={(v) => setModal((p) => ({ ...p, deliveredAt: v }))} type="date" /></div>}
              </div>
              {(modal.status === "em_revisao" || modal.status === "aprovado") && (
                <div><FormLabel>Notas de Revisão</FormLabel><textarea value={modal.reviewNotes ?? ""} onChange={(e) => setModal((p) => ({ ...p, reviewNotes: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none" /></div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={!modal.title} className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
                {isEditing ? "Salvar" : "Criar Entrega"}
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
function FormInput({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors" />;
}
