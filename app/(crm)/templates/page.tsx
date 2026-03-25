"use client";
import { useState } from "react";
import {
  Plus, X, Pencil, Trash2, LayoutTemplate, ChevronRight,
  ChevronDown, GripVertical, User, Clock, Tag, CheckCircle2,
  Circle, AlertCircle, Zap, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProjectTemplates, createProjectTemplate, updateProjectTemplate,
  deleteProjectTemplate, addTemplateTask, updateTemplateTask,
  deleteTemplateTask, useUsers,
  type ProjectTemplate, type TemplateTask,
} from "@/hooks/use-data";
import { PRIORITY_LABELS, PRIORITY_COLORS, getInitials } from "@/lib/utils-crm";

// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIES = ["geral", "marketing", "design", "desenvolvimento", "social_media", "trafego", "consultoria", "evento"];
const CATEGORY_LABELS: Record<string, string> = {
  geral: "Geral", marketing: "Marketing", design: "Design",
  desenvolvimento: "Desenvolvimento", social_media: "Social Media",
  trafego: "Tráfego Pago", consultoria: "Consultoria", evento: "Evento",
};
const TEMPLATE_COLORS = ["#EAB308", "#3B82F6", "#10B981", "#F97316", "#8B5CF6", "#EC4899", "#14B8A6", "#EF4444"];
const PRIORITIES = ["baixa", "media", "alta", "urgente"] as const;

const EMPTY_TEMPLATE: Omit<ProjectTemplate, "id" | "tasks" | "createdAt" | "updatedAt"> = {
  name: "", description: "", category: "geral", color: "#EAB308", icon: "layout",
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">{children}</label>;
}

function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{done}/{total} tarefas</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Task Row no editor ───────────────────────────────────────────────────────
function TaskRow({
  task, templateId, users, onDelete,
}: {
  task: TemplateTask;
  templateId: string;
  users: { id: string; name: string }[];
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [priority, setPriority] = useState(task.priority ?? "media");
  const [dueDays, setDueDays] = useState(task.dueDays ?? 0);
  const [deliverable, setDeliverable] = useState(task.deliverable ?? "");

  async function save() {
    await updateTemplateTask(task.id, {
      title, description: desc || null, assigneeId: assigneeId || null,
      priority, dueDays, deliverable: deliverable || null,
    });
  }

  return (
    <div className="border-2 border-gray-100 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical size={14} className="text-gray-300 flex-shrink-0 cursor-grab" />
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 flex items-center gap-2 min-w-0 text-left">
          <span className="text-sm font-medium text-gray-800 truncate">{title || "Nova tarefa"}</span>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS])}>
            {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
          </span>
          {assigneeId && users.find((u) => u.id === assigneeId) && (
            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-[9px] font-bold text-black">
                {getInitials(users.find((u) => u.id === assigneeId)!.name)}
              </span>
            </div>
          )}
          <button onClick={() => setExpanded((e) => !e)} className="p-0.5 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          <button onClick={onDelete} className="p-0.5 text-gray-300 hover:text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-gray-100 px-3 py-3 space-y-3 bg-gray-50/50">
          <div>
            <FormLabel>Título</FormLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={save}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <FormLabel>Descrição</FormLabel>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={save}
              rows={2}
              placeholder="Descreva o que deve ser feito..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <FormLabel>Responsável</FormLabel>
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); }}
                onBlur={save}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400 bg-white"
              >
                <option value="">Sem responsável</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <FormLabel>Prioridade</FormLabel>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); }}
                onBlur={save}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400 bg-white"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <FormLabel>Prazo (dias)</FormLabel>
              <input
                type="number" min={0} max={999}
                value={dueDays}
                onChange={(e) => setDueDays(Number(e.target.value))}
                onBlur={save}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
          <div>
            <FormLabel>Entregavel</FormLabel>
            <input
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              onBlur={save}
              placeholder="ex: Post feed, Relatório mensal..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────
function TemplateCard({
  template, users, onEdit, onDelete,
}: {
  template: ProjectTemplate;
  users: { id: string; name: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const total = template.tasks.length;
  const withAssignee = template.tasks.filter((t) => t.assigneeId).length;
  const withDeliverable = template.tasks.filter((t) => t.deliverable).length;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-md transition-all group">
      {/* Color band */}
      <div className="h-2 rounded-t-2xl" style={{ backgroundColor: template.color }} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {CATEGORY_LABELS[template.category] ?? template.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{template.name}</h3>
            {template.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
            <button onClick={onEdit} className="p-1.5 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg text-gray-400 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ListChecks size={12} />
            {total} {total === 1 ? "tarefa" : "tarefas"}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} />
            {withAssignee} responsável{withAssignee !== 1 ? "is" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={12} />
            {withDeliverable} entregável{withDeliverable !== 1 ? "is" : ""}
          </span>
        </div>

        {/* Task preview */}
        {total > 0 && (
          <div className="space-y-1.5 mb-4">
            {template.tasks.slice(0, 3).map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              return (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <Circle size={10} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-700 flex-1 truncate">{task.title}</span>
                  {assignee && (
                    <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-bold text-black">{getInitials(assignee.name)}</span>
                    </div>
                  )}
                  {task.deliverable && (
                    <span className="text-gray-400 truncate max-w-[60px]">{task.deliverable}</span>
                  )}
                </div>
              );
            })}
            {total > 3 && (
              <p className="text-[10px] text-gray-400 pl-4">+{total - 3} mais...</p>
            )}
          </div>
        )}

        {total === 0 && (
          <div className="text-center py-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl mb-4">
            Nenhuma tarefa adicionada ainda
          </div>
        )}

        <button
          onClick={onEdit}
          className="w-full py-2 text-xs font-bold border-2 border-dashed rounded-xl transition-all hover:bg-gray-50"
          style={{ borderColor: template.color, color: template.color }}
        >
          Editar template
        </button>
      </div>
    </div>
  );
}

// ─── Template Editor Modal ────────────────────────────────────────────────────
function TemplateEditorModal({
  template, users, onClose,
}: {
  template: ProjectTemplate;
  users: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [category, setCategory] = useState(template.category);
  const [color, setColor] = useState(template.color);
  const [saving, setSaving] = useState(false);

  const total = template.tasks.length;
  const withAssignee = template.tasks.filter((t) => t.assigneeId).length;

  async function saveHeader() {
    if (!name.trim()) return;
    setSaving(true);
    await updateProjectTemplate(template.id, { name, description, category, color });
    setSaving(false);
  }

  async function handleAddTask() {
    await addTemplateTask(template.id, {
      title: "Nova tarefa",
      priority: "media",
      dueDays: 0,
    });
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTemplateTask(taskId);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ borderTopColor: color, borderTopWidth: 4 }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
              <LayoutTemplate size={16} style={{ color }} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{name || "Novo Template"}</h2>
              <p className="text-xs text-gray-400">{total} {total === 1 ? "tarefa" : "tarefas"} · {withAssignee} responsável{withAssignee !== 1 ? "is" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info do template */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FormLabel>Nome do Template</FormLabel>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveHeader}
                  placeholder="ex: Campanha de Lançamento"
                  className="w-full text-sm font-semibold border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <FormLabel>Categoria</FormLabel>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); }}
                  onBlur={saveHeader}
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400 bg-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Cor</FormLabel>
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); saveHeader(); }}
                      className={cn("w-7 h-7 rounded-lg border-2 transition-all", color === c ? "border-gray-900 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <FormLabel>Descrição</FormLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveHeader}
                  rows={2}
                  placeholder="Para que serve este template?"
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Tarefas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Tarefas do Template</h3>
                <p className="text-xs text-gray-400">Defina os entregáveis, responsáveis e prazos relativos</p>
              </div>
              <button
                onClick={handleAddTask}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-yellow-400 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                <Plus size={12} /> Nova tarefa
              </button>
            </div>

            {template.tasks.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                <ListChecks size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">Nenhuma tarefa ainda</p>
                <p className="text-xs text-gray-300">Clique em &ldquo;Nova tarefa&rdquo; para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {template.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    templateId={template.id}
                    users={users}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Progresso (visualização) */}
          {template.tasks.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Visão do Progresso</h3>
              <ProgressBar done={0} total={template.tasks.length} color={color} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <p className="text-lg font-black text-gray-900">{template.tasks.length}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Total de tarefas</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <p className="text-lg font-black" style={{ color }}>{withAssignee}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Com responsável</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <p className="text-lg font-black text-gray-900">{template.tasks.filter((t) => t.deliverable).length}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Entregáveis</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {saving ? "Salvando..." : "Fechar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const { templates, isLoading } = useProjectTemplates();
  const { users } = useUsers();
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("geral");
  const [newColor, setNewColor] = useState("#EAB308");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [creating, setCreating] = useState(false);

  const filtered = filterCategory === "todos"
    ? templates
    : templates.filter((t) => t.category === filterCategory);

  const categories = ["todos", ...Array.from(new Set(templates.map((t) => t.category)))];

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const created = await createProjectTemplate({ name: newName, category: newCategory, color: newColor, description: "" });
    setCreating(false);
    setShowNewModal(false);
    setNewName("");
    setNewCategory("geral");
    setNewColor("#EAB308");
    setEditingTemplate(created);
  }

  async function handleDelete(id: string) {
    if (!confirm("Deletar este template? Esta ação não pode ser desfeita.")) return;
    await deleteProjectTemplate(id);
  }

  // Sync editingTemplate com dados atualizados do SWR
  const syncedEditingTemplate = editingTemplate
    ? (templates.find((t) => t.id === editingTemplate.id) ?? editingTemplate)
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Templates de Projetos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Modelos reutilizáveis com tarefas, responsáveis e entregáveis predefinidos
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Novo Template
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all",
              filterCategory === cat
                ? "bg-black text-yellow-400 border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            {cat === "todos" ? "Todos" : (CATEGORY_LABELS[cat] ?? cat)}
            {cat !== "todos" && (
              <span className="ml-1 text-[10px] opacity-60">
                ({templates.filter((t) => t.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid de Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <LayoutTemplate size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-500">Nenhum template encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Crie um template para agilizar novos projetos</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="mt-4 flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors mx-auto"
          >
            <Plus size={14} /> Criar primeiro template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              users={users}
              onEdit={() => setEditingTemplate(template)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      )}

      {/* Modal criar novo */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Novo Template</h2>
              <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <FormLabel>Nome</FormLabel>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="ex: Campanha de Marketing"
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400 font-semibold"
                />
              </div>
              <div>
                <FormLabel>Categoria</FormLabel>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-400 bg-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Cor</FormLabel>
                <div className="flex gap-2 flex-wrap">
                  {TEMPLATE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={cn("w-8 h-8 rounded-lg border-2 transition-all", newColor === c ? "border-gray-900 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {creating ? "Criando..." : "Criar e editar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editor de template */}
      {syncedEditingTemplate && (
        <TemplateEditorModal
          template={syncedEditingTemplate}
          users={users}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
}
