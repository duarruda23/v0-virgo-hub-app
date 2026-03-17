"use client";
import { useState, useRef, useMemo } from "react";
import { ClientOnly } from "@/components/crm/ClientOnly";
import { Plus, X, Search, Calendar, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasksStore, useUsersStore, useProjectsStore } from "@/lib/store";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import {
  TASK_STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS,
  formatDate, getInitials, generateId
} from "@/lib/utils-crm";

const COLUMNS: TaskStatus[] = ["backlog", "a_fazer", "em_progresso", "em_revisao", "concluida"];

const COL_COLORS: Record<TaskStatus, string> = {
  backlog: "border-t-gray-400",
  a_fazer: "border-t-blue-400",
  em_progresso: "border-t-yellow-400",
  em_revisao: "border-t-orange-400",
  concluida: "border-t-green-500",
};

const EMPTY_TASK: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", assigneeId: "u1", creatorId: "u1",
  status: "a_fazer", priority: "media", tags: [],
};

export default function TarefasPage() {
  const { tasks, addTask, updateTask, deleteTask, moveTaskStatus } = useTasksStore();
  const { users } = useUsersStore();
  const { projects } = useProjectsStore();

  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [modal, setModal] = useState<Partial<Task> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const dragItem = useRef<string | null>(null);

  const filtered = useMemo(() => tasks.filter((t) => {
    const matchSearch = search === "" || t.title.toLowerCase().includes(search.toLowerCase());
    const matchAssignee = filterAssignee === "all" || t.assigneeId === filterAssignee;
    return matchSearch && matchAssignee;
  }), [tasks, search, filterAssignee]);

  const getColTasks = (status: TaskStatus) => filtered.filter((t) => t.status === status);

  const onDragStart = (id: string) => { dragItem.current = id; setDragging(id); };
  const onDragEnd = () => { setDragging(null); setDragOver(null); dragItem.current = null; };
  const onDrop = (status: TaskStatus) => {
    if (dragItem.current) moveTaskStatus(dragItem.current, status);
    setDragOver(null); setDragging(null); dragItem.current = null;
  };

  const handleSave = () => {
    if (!modal?.title) return;
    if (isEditing && modal.id) {
      updateTask(modal.id, modal);
    } else {
      addTask({
        ...EMPTY_TASK, ...modal,
        id: generateId("t"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      } as Task);
    }
    setModal(null); setIsEditing(false);
  };

  const openEdit = (task: Task) => { setModal({ ...task }); setIsEditing(true); };
  const openNew = (status: TaskStatus = "a_fazer") => { setModal({ ...EMPTY_TASK, status }); setIsEditing(false); };

  const totalOpen = tasks.filter((t) => t.status !== "concluida").length;
  const totalDone = tasks.filter((t) => t.status === "concluida").length;

  return (
    <div className="flex flex-col gap-4 -m-6 p-6 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Topbar */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarefa..."
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-56 focus:outline-none focus:border-yellow-400"
          />
        </div>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">Todos os membros</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-gray-500"><span className="font-bold text-gray-900">{totalOpen}</span> abertas</span>
          <span className="text-gray-500"><span className="font-bold text-green-600">{totalDone}</span> concluídas</span>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const colTasks = getColTasks(col);
          const isOver = dragOver === col;
          return (
            <div
              key={col}
              className={cn(
                "flex flex-col flex-shrink-0 w-60 rounded-xl border border-gray-200 bg-gray-50 transition-colors",
                isOver && "bg-yellow-50 border-yellow-300"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => onDrop(col)}
            >
              <div className={cn("px-3 pt-3 pb-2 border-t-4 rounded-t-xl flex items-center justify-between", COL_COLORS[col])}>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{TASK_STATUS_LABELS[col]}</span>
                <span className="text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded-full font-bold text-gray-500">{colTasks.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 min-h-[80px]">
                {colTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const isLate = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "concluida";
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => onDragStart(task.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => openEdit(task)}
                      className={cn(
                        "bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-gray-300 transition-all select-none",
                        dragging === task.id && "opacity-40 scale-95"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className={cn(
                          "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                          task.priority === "urgente" && "bg-red-500",
                          task.priority === "alta" && "bg-orange-500",
                          task.priority === "media" && "bg-blue-500",
                          task.priority === "baixa" && "bg-gray-400",
                        )} />
                        <p className="text-xs font-semibold text-gray-900 leading-tight flex-1">{task.title}</p>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 mb-2">
                          <Calendar suppressHydrationWarning size={9} className={isLate ? "text-red-400" : "text-gray-400"} />
                          <span suppressHydrationWarning className={cn("text-[10px]", isLate ? "text-red-500 font-semibold" : "text-gray-400")}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", PRIORITY_COLORS[task.priority])}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        {assignee && (
                          <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center" title={assignee.name}>
                            <span className="text-[8px] font-bold text-yellow-400">{getInitials(assignee.name)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => openNew(col)}
                className="mx-2 mb-2 p-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-white border border-dashed border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={11} /> Adicionar
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Tarefa" : "Nova Tarefa"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Título *</label>
                <input
                  value={modal.title ?? ""}
                  onChange={(e) => setModal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400"
                  placeholder="Descreva a tarefa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                  <select value={modal.status ?? "a_fazer"} onChange={(e) => setModal((p) => ({ ...p, status: e.target.value as TaskStatus }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {COLUMNS.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Prioridade</label>
                  <select value={modal.priority ?? "media"} onChange={(e) => setModal((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(["baixa", "media", "alta", "urgente"] as TaskPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Responsável</label>
                  <select value={modal.assigneeId ?? "u1"} onChange={(e) => setModal((p) => ({ ...p, assigneeId: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Prazo</label>
                  <input type="date" value={modal.dueDate ?? ""} onChange={(e) => setModal((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Projeto</label>
                  <select value={modal.projectId ?? ""} onChange={(e) => setModal((p) => ({ ...p, projectId: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    <option value="">Sem projeto</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descrição</label>
                  <textarea value={modal.description ?? ""} onChange={(e) => setModal((p) => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none"
                    placeholder="Detalhes da tarefa..." />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center">
              {isEditing && (
                <button onClick={() => { deleteTask(modal.id!); setModal(null); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium">Excluir</button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-bold bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition-colors">
                  {isEditing ? "Salvar" : "Criar Tarefa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
