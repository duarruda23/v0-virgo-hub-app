"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, X, Search, Calendar, Users, Pencil, Trash2, CheckSquare, Square, Trash, CornerDownLeft, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProjects, createProject, updateProject, deleteProject,
  useClients, useUsers,
  useProjectChecklist, addChecklistItem, toggleChecklistItem, updateChecklistItem, deleteChecklistItem,
} from "@/hooks/use-data";
import type { Project, ProjectStatus, ProjectPriority } from "@/lib/types";
import {
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  formatCurrency, formatDate, getInitials, generateId,
} from "@/lib/utils-crm";

const EMPTY: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "", description: "", clientId: "", status: "briefing",
  priority: "media", managerId: "", teamIds: [], budget: 0,
  startDate: new Date().toISOString().split("T")[0],
  dueDate: "", tags: [], progress: 0,
};

const ALL_STATUSES: ProjectStatus[] = ["briefing", "planejamento", "em_execucao", "revisao", "aprovacao", "concluido", "pausado", "cancelado"];

// ─── Checklist Panel ──────────────────────────────────────────────────────────
function ChecklistPanel({ projectId }: { projectId: string }) {
  const { items, isLoading } = useProjectChecklist(projectId);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  async function handleAdd() {
    const text = newText.trim();
    if (!text) return;
    setNewText("");
    await addChecklistItem(projectId, text);
  }

  async function handleEditSave(id: string) {
    const text = editText.trim();
    if (text) await updateChecklistItem(id, projectId, text);
    setEditingId(null);
  }

  return (
    <div className="space-y-3">
      {/* Header com progresso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Checklist</p>
        </div>
        {total > 0 && (
          <span className="text-xs font-bold text-gray-600">{done}/{total}</span>
        )}
      </div>

      {/* Barra de progresso do checklist */}
      {total > 0 && (
        <div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-green-400" : "bg-yellow-400")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{pct}% concluído</p>
        </div>
      )}

      {/* Itens */}
      {isLoading && <p className="text-xs text-gray-400">Carregando...</p>}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 group rounded-lg px-1 py-1 hover:bg-gray-50 transition-colors">
            <button
              onClick={() => toggleChecklistItem(item.id, projectId, !item.done)}
              className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-yellow-500 transition-colors"
            >
              {item.done
                ? <CheckSquare size={15} className="text-green-500" />
                : <Square size={15} />
              }
            </button>

            {editingId === item.id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(item.id); if (e.key === "Escape") setEditingId(null); }}
                  className="flex-1 text-xs border border-yellow-300 rounded px-2 py-0.5 focus:outline-none"
                />
                <button onClick={() => handleEditSave(item.id)} className="text-yellow-500 hover:text-yellow-600"><CornerDownLeft size={12} /></button>
              </div>
            ) : (
              <span
                onDoubleClick={() => { setEditingId(item.id); setEditText(item.text); }}
                className={cn("flex-1 text-xs leading-relaxed cursor-text", item.done ? "line-through text-gray-400" : "text-gray-700")}
                title="Duplo clique para editar"
              >
                {item.text}
              </span>
            )}

            <button
              onClick={() => deleteChecklistItem(item.id, projectId)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Trash size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Input novo item */}
      <div className="flex items-center gap-2 mt-1">
        <input
          ref={inputRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="Adicionar item..."
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="p-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjetosPage() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { users } = useUsers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "todos">("todos");
  const [modal, setModal] = useState<Partial<Project> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detail, setDetail] = useState<Project | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "todos") list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [projects, search, statusFilter]);

  const handleSave = async () => {
    if (!modal?.name) return;
    // Garante IDs válidos — nunca envia "c1" ou "u1" hardcoded
    const validClientId = clients.find((c) => c.id === modal.clientId)?.id ?? clients[0]?.id ?? null;
    const validManagerId = users.find((u) => u.id === modal.managerId)?.id ?? users[0]?.id ?? null;
    if (!validClientId) return; // nenhum cliente cadastrado ainda
    const payload = { ...EMPTY, ...modal, clientId: validClientId, managerId: validManagerId ?? "" };
    if (isEditing && modal.id) {
      await updateProject(modal.id, payload);
    } else {
      await createProject(payload);
    }
    setModal(null);
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });
    return counts;
  }, [projects]);

  return (
    <div className="space-y-5">
      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("todos")}
          className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
            statusFilter === "todos" ? "bg-black text-yellow-400 border-black" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
        >
          Todos ({projects.length})
        </button>
        {ALL_STATUSES.filter((s) => (statusCounts[s] ?? 0) > 0).map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "todos" : s)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              statusFilter === s ? "bg-black text-yellow-400 border-black" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>
            {PROJECT_STATUS_LABELS[s]} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projeto..." className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-full focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-xs font-semibold", view === "grid" ? "bg-black text-yellow-400" : "bg-white text-gray-500 hover:bg-gray-50")}>Grid</button>
          <button onClick={() => setView("list")} className={cn("px-3 py-2 text-xs font-semibold", view === "list" ? "bg-black text-yellow-400" : "bg-white text-gray-500 hover:bg-gray-50")}>Lista</button>
        </div>
        <button onClick={() => { setModal({ ...EMPTY, clientId: clients[0]?.id ?? "", managerId: users[0]?.id ?? "" }); setIsEditing(false); }} className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
          <Plus size={15} /> Novo Projeto
        </button>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            const manager = users.find((u) => u.id === project.managerId);
            const isLate = project.status !== "concluido" && project.status !== "cancelado" && project.dueDate && new Date(project.dueDate) < new Date();
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all cursor-pointer group" onClick={() => setDetail(project)}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 leading-tight truncate">{project.name}</p>
                    {client && <p className="text-xs text-gray-400 mt-0.5">{client.company ?? client.name}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setModal({ ...project }); setIsEditing(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={12} /></button>
                    <button onClick={() => deleteProject(project.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>{PROJECT_STATUS_LABELS[project.status]}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PRIORITY_COLORS[project.priority])}>{PRIORITY_LABELS[project.priority]}</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Progresso</span>
                    <span className="text-xs font-bold text-gray-700">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span suppressHydrationWarning className={cn(isLate && "text-red-500 font-semibold")}>{formatDate(project.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-1"><Users size={11} /><span>{project.teamIds.length + 1}</span></div>
                  {project.budget > 0 && <span className="font-semibold text-gray-600">{formatCurrency(project.budget)}</span>}
                </div>
                {manager && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-yellow-400">{getInitials(manager.name)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{manager.name.split(" ")[0]}</span>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-gray-400">Nenhum projeto encontrado</div>
          )}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Projeto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Progresso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((project) => {
                const client = clients.find((c) => c.id === project.clientId);
                const isLate = project.status !== "concluido" && project.dueDate && new Date(project.dueDate) < new Date();
                return (
                  <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetail(project)}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{project.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{client?.company ?? client?.name ?? "—"}</td>
                    <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>{PROJECT_STATUS_LABELS[project.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${project.progress}%` }} /></div>
                        <span className="text-xs font-bold text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs"><span suppressHydrationWarning className={cn(isLate ? "text-red-500 font-bold" : "text-gray-400")}>{formatDate(project.dueDate)}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{project.budget ? formatCurrency(project.budget) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setModal({ ...project }); setIsEditing(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={13} /></button>
                        <button onClick={() => deleteProject(project.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel */}
      {detail && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900 text-sm leading-tight pr-4">{detail.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => { setModal({ ...detail }); setIsEditing(true); setDetail(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Pencil size={15} /></button>
                <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={15} /></button>
              </div>
            </div>
            <div className="p-5 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-semibold", PROJECT_STATUS_COLORS[detail.status])}>{PROJECT_STATUS_LABELS[detail.status]}</span>
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-semibold", PRIORITY_COLORS[detail.priority])}>{PRIORITY_LABELS[detail.priority]}</span>
              </div>

              {/* Progresso do projeto */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Progresso</span>
                  <span className="text-sm font-black text-gray-900">{detail.progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${detail.progress}%` }} />
                </div>
              </div>

              {detail.description && (
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">{detail.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Início</p><p className="font-semibold text-gray-900 mt-0.5">{formatDate(detail.startDate)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Prazo</p><p className="font-semibold text-gray-900 mt-0.5">{formatDate(detail.dueDate)}</p></div>
                {detail.budget > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 col-span-2"><p className="text-xs text-yellow-600">Budget</p><p className="font-black text-gray-900 mt-0.5">{formatCurrency(detail.budget)}</p></div>
                )}
              </div>

              {/* Equipe */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Equipe</p>
                <div className="flex flex-wrap gap-2">
                  {[detail.managerId, ...detail.teamIds].map((uid) => {
                    const u = users.find((x) => x.id === uid);
                    return u ? (
                      <div key={uid} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"><span className="text-[8px] font-bold text-yellow-400">{getInitials(u.name)}</span></div>
                        <span className="text-xs text-gray-700">{u.name.split(" ")[0]}</span>
                        {uid === detail.managerId && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1 rounded font-bold">Gestor</span>}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Checklist */}
              <div className="border-t border-gray-100 pt-5">
                <ChecklistPanel projectId={detail.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Projeto" : "Novo Projeto"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
              <div><FormLabel>Nome *</FormLabel><FormInput value={modal.name ?? ""} onChange={(v) => setModal((p) => ({ ...p, name: v }))} /></div>
              <div><FormLabel>Descrição</FormLabel><textarea value={modal.description ?? ""} onChange={(e) => setModal((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Cliente *</FormLabel>
                  <select value={modal.clientId ?? ""} onChange={(e) => setModal((p) => ({ ...p, clientId: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.company ?? c.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Gestor</FormLabel>
                  <select value={modal.managerId ?? ""} onChange={(e) => setModal((p) => ({ ...p, managerId: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Status</FormLabel>
                  <select value={modal.status ?? "briefing"} onChange={(e) => setModal((p) => ({ ...p, status: e.target.value as ProjectStatus }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Prioridade</FormLabel>
                  <select value={modal.priority ?? "media"} onChange={(e) => setModal((p) => ({ ...p, priority: e.target.value as ProjectPriority }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(["baixa", "media", "alta", "urgente"] as ProjectPriority[]).map((s) => <option key={s} value={s}>{PRIORITY_LABELS[s]}</option>)}
                  </select>
                </div>
                <div><FormLabel>Início</FormLabel><FormInput value={modal.startDate ?? ""} onChange={(v) => setModal((p) => ({ ...p, startDate: v }))} type="date" /></div>
                <div><FormLabel>Prazo</FormLabel><FormInput value={modal.dueDate ?? ""} onChange={(v) => setModal((p) => ({ ...p, dueDate: v }))} type="date" /></div>
                <div><FormLabel>Budget (R$)</FormLabel><FormInput value={String(modal.budget ?? 0)} onChange={(v) => setModal((p) => ({ ...p, budget: Number(v) }))} type="number" /></div>
                <div><FormLabel>Progresso (%)</FormLabel><FormInput value={String(modal.progress ?? 0)} onChange={(v) => setModal((p) => ({ ...p, progress: Math.min(100, Math.max(0, Number(v))) }))} type="number" /></div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={!modal.name || !modal.clientId} className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
                {isEditing ? "Salvar" : "Criar Projeto"}
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
