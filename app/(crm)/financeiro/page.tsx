"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, AlertCircle, Clock, Plus, X,
  CheckCircle2, ChevronDown, Search, Filter, ArrowUpRight,
  ArrowDownRight, DollarSign, Users, Calendar, Pencil, Trash2,
} from "lucide-react";
import {
  useFinancialEntries, createFinancialEntry, updateFinancialEntry,
  deleteFinancialEntry, type FinancialEntry, useClients, useProjects,
} from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils-crm";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RECEITA_CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: "mrr",       label: "MRR (Recorrente)",   color: "bg-blue-100 text-blue-800" },
  { value: "avulso",    label: "Cobrança Avulsa",     color: "bg-purple-100 text-purple-800" },
  { value: "bonus",     label: "Bônus",               color: "bg-green-100 text-green-800" },
  { value: "comissao",  label: "Comissão",             color: "bg-teal-100 text-teal-800" },
  { value: "ajuste",    label: "Ajuste",               color: "bg-yellow-100 text-yellow-800" },
  { value: "desconto",  label: "Desconto",             color: "bg-orange-100 text-orange-800" },
  { value: "reembolso", label: "Reembolso",            color: "bg-pink-100 text-pink-800" },
  { value: "parcela",   label: "Parcela de Projeto",   color: "bg-indigo-100 text-indigo-800" },
];

const DESPESA_CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: "salario",      label: "Salário",               color: "bg-blue-100 text-blue-800" },
  { value: "aluguel",      label: "Aluguel / Espaço",      color: "bg-orange-100 text-orange-800" },
  { value: "investimento", label: "Investimento",           color: "bg-purple-100 text-purple-800" },
  { value: "imposto",      label: "Imposto / Taxa",         color: "bg-red-100 text-red-800" },
  { value: "fornecedor",   label: "Fornecedor / Serviço",   color: "bg-yellow-100 text-yellow-800" },
  { value: "ferramenta",   label: "Ferramenta / Software",  color: "bg-cyan-100 text-cyan-800" },
  { value: "marketing",    label: "Marketing / Tráfego",    color: "bg-pink-100 text-pink-800" },
  { value: "comissao",     label: "Comissão Paga",          color: "bg-teal-100 text-teal-800" },
  { value: "reembolso",    label: "Reembolso",              color: "bg-gray-100 text-gray-700" },
  { value: "outros",       label: "Outros",                 color: "bg-gray-100 text-gray-600" },
];

const ALL_CATEGORIES = [...RECEITA_CATEGORIES, ...DESPESA_CATEGORIES];

function getCategoriesForType(type: string) {
  return type === "despesa" ? DESPESA_CATEGORIES : RECEITA_CATEGORIES;
}

const CATEGORIES = ALL_CATEGORIES;

const STATUS_STYLES: Record<string, string> = {
  pago:      "bg-green-100 text-green-700 border-green-200",
  pendente:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  atrasado:  "bg-red-100 text-red-700 border-red-200",
  cancelado: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pago: "Pago", pendente: "Pendente", atrasado: "Atrasado", cancelado: "Cancelado",
};

function catLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}
function catColor(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.color ?? "bg-gray-100 text-gray-600";
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const EMPTY: Partial<FinancialEntry> = {
  type: "receita", category: "avulso", description: "", amount: 0,
  status: "pendente", dueDate: "", recurrent: false, notes: "",
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-black p-5 flex items-start gap-4">
      <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0", accent)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Entry Modal ─────────────────────────────────────────────────────────────
function EntryModal({ initial, clients, projects, onSave, onClose }: {
  initial: Partial<FinancialEntry>;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  onSave: (data: Partial<FinancialEntry>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<FinancialEntry>>(initial);
  const set = (k: keyof FinancialEntry, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const availableCategories = getCategoriesForType(form.type ?? "receita");

  function handleTypeChange(t: "receita" | "despesa") {
    const defaultCat = t === "despesa" ? "salario" : "avulso";
    setForm((p) => ({ ...p, type: t, category: defaultCat as FinancialEntry["category"] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-xl border-2 border-black w-full max-w-lg shadow-[6px_6px_0px_#000] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="text-base font-black">{initial.id ? "Editar Lançamento" : "Novo Lançamento"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4">
          {/* Tipo */}
          <div className="flex gap-2">
            {(["receita", "despesa"] as const).map((t) => (
              <button key={t} onClick={() => handleTypeChange(t)}
                className={cn("flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-colors flex items-center justify-center gap-2",
                  form.type === t
                    ? t === "receita"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-red-500 bg-red-500 text-white"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                )}>
                {t === "receita" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              Categoria {form.type === "despesa" ? "de Despesa" : "de Receita"}
            </label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
              {availableCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Descrição *</label>
            <input value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400"
              placeholder="Ex: Gestão de tráfego - Maio" />
          </div>

          {/* Valor e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Valor (R$) *</label>
              <input type="number" min={0} step={0.01} value={form.amount ?? 0}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Vencimento</label>
              <input type="date" value={form.dueDate ?? ""}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Pago em</label>
              <input type="date" value={form.paidAt ?? ""}
                onChange={(e) => set("paidAt", e.target.value)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Cliente e Projeto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Cliente</label>
              <select value={form.clientId ?? ""}
                onChange={(e) => set("clientId", e.target.value || null)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                <option value="">Nenhum</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Projeto</label>
              <select value={form.projectId ?? ""}
                onChange={(e) => set("projectId", e.target.value || null)}
                className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                <option value="">Nenhum</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Recorrente */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!form.recurrent}
              onChange={(e) => set("recurrent", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-yellow-400" />
            <span className="text-sm text-gray-700 font-medium">Lançamento recorrente (mensal)</span>
          </label>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Observações</label>
            <textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
              className="w-full text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Ex: Acréscimo por horas extras, desconto negociado..." />
          </div>
        </div>

        <div className="px-6 py-4 border-t-2 border-black flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black transition-colors">Cancelar</button>
          <button onClick={() => { if (form.description && form.amount != null) onSave(form); }}
            disabled={!form.description || !form.amount}
            className="px-5 py-2 bg-yellow-400 text-black text-sm font-black rounded-lg border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-40">
            {initial.id ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const { entries, isLoading } = useFinancialEntries();
  const { clients } = useClients();
  const { projects } = useProjects();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [filterClient, setFilterClient] = useState("");
  const [activeTab, setActiveTab] = useState<"extrato" | "despesas" | "previsao" | "inadimplencia" | "porcliente">("extrato");
  const [modal, setModal] = useState<Partial<FinancialEntry> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // KPIs globais
  const totalReceitas = useMemo(() => entries.filter((e) => e.type === "receita" && e.status === "pago").reduce((s, e) => s + e.amount, 0), [entries]);
  const totalPendente = useMemo(() => entries.filter((e) => e.type === "receita" && e.status === "pendente").reduce((s, e) => s + e.amount, 0), [entries]);
  const totalAtrasado = useMemo(() => entries.filter((e) => e.status === "atrasado").reduce((s, e) => s + e.amount, 0), [entries]);
  const totalDespesas = useMemo(() => entries.filter((e) => e.type === "despesa" && e.status === "pago").reduce((s, e) => s + e.amount, 0), [entries]);
  const resultado = totalReceitas - totalDespesas;

  // Despesas por categoria
  const despesasPorCategoria = useMemo(() => {
    const map: Record<string, { label: string; color: string; total: number; pendente: number; count: number }> = {};
    entries.filter((e) => e.type === "despesa").forEach((e) => {
      const cat = DESPESA_CATEGORIES.find((c) => c.value === e.category);
      if (!map[e.category]) map[e.category] = { label: cat?.label ?? e.category, color: cat?.color ?? "bg-gray-100 text-gray-600", total: 0, pendente: 0, count: 0 };
      if (e.status === "pago") map[e.category].total += e.amount;
      if (e.status === "pendente") map[e.category].pendente += e.amount;
      map[e.category].count += 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => (b.total + b.pendente) - (a.total + a.pendente));
  }, [entries]);

  // Extrato filtrado
  const filtered = useMemo(() => {
    let list = entries;
    if (search) list = list.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "todos") list = list.filter((e) => e.status === filterStatus);
    if (filterType !== "todos") list = list.filter((e) => e.type === filterType);
    if (filterClient) list = list.filter((e) => e.clientId === filterClient);
    return list.sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return db - da;
    });
  }, [entries, search, filterStatus, filterType, filterClient]);

  // Previsão: próximos 3 meses agrupados por mês
  const previsao = useMemo(() => {
    const months: Record<string, { label: string; receita: number; despesa: number; entries: FinancialEntry[] }> = {};
    entries.filter((e) => e.status === "pendente" && e.dueDate).forEach((e) => {
      const d = new Date(e.dueDate! + "T12:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { label: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), receita: 0, despesa: 0, entries: [] };
      if (e.type === "receita") months[key].receita += e.amount;
      else months[key].despesa += e.amount;
      months[key].entries.push(e);
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(0, 6);
  }, [entries]);

  // Inadimplência
  const inadimplentes = useMemo(() => {
    return entries.filter((e) => {
      if (e.status === "pago" || e.status === "cancelado") return false;
      if (!e.dueDate) return false;
      return new Date(e.dueDate + "T12:00:00") < today;
    });
  }, [entries]);

  // Por cliente
  const porCliente = useMemo(() => {
    const map: Record<string, { name: string; receita: number; despesa: number; pendente: number; atrasado: number }> = {};
    entries.forEach((e) => {
      if (!e.clientId) return;
      const c = clients.find((cl) => cl.id === e.clientId);
      if (!map[e.clientId]) map[e.clientId] = { name: c?.name ?? e.clientId, receita: 0, despesa: 0, pendente: 0, atrasado: 0 };
      if (e.status === "pago") {
        if (e.type === "receita") map[e.clientId].receita += e.amount;
        else map[e.clientId].despesa += e.amount;
      }
      if (e.status === "pendente") map[e.clientId].pendente += e.amount;
      if (e.status === "atrasado") map[e.clientId].atrasado += e.amount;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.receita - a.receita);
  }, [entries, clients]);

  async function handleSave(data: Partial<FinancialEntry>) {
    if (isEditing && data.id) {
      await updateFinancialEntry(data.id, data);
    } else {
      await createFinancialEntry(data);
    }
    setModal(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este lançamento?")) return;
    await deleteFinancialEntry(id);
  }

  async function handleMarkPaid(entry: FinancialEntry) {
    await updateFinancialEntry(entry.id, {
      status: "pago",
      paidAt: new Date().toISOString().split("T")[0],
    });
  }

  function openNew() { setModal({ ...EMPTY }); setIsEditing(false); }
  function openEdit(e: FinancialEntry) { setModal({ ...e }); setIsEditing(true); }

  const TABS = [
    { key: "extrato",       label: "Extrato" },
    { key: "despesas",      label: "Despesas" },
    { key: "previsao",      label: "Previsão" },
    { key: "inadimplencia", label: `Inadimplência${inadimplentes.length > 0 ? ` (${inadimplentes.length})` : ""}` },
    { key: "porcliente",    label: "Por Cliente" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Receitas, despesas, variáveis e inadimplência</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-lg border-2 border-black font-black text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Receita Recebida" value={formatCurrency(totalReceitas)} icon={TrendingUp}
          accent="bg-green-100 text-green-700" sub="lançamentos pagos" />
        <KpiCard label="Despesas Pagas" value={formatCurrency(totalDespesas)} icon={TrendingDown}
          accent="bg-red-100 text-red-700" sub="salários, aluguel, etc." />
        <KpiCard label="Resultado Líquido" value={formatCurrency(resultado)} icon={DollarSign}
          accent={resultado >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
          sub={resultado >= 0 ? "superávit" : "déficit"} />
        <KpiCard label="A Receber" value={formatCurrency(totalPendente)} icon={Clock}
          accent="bg-yellow-100 text-yellow-700" sub={`${inadimplentes.length} em atraso`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-gray-100">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn("px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-[2px]",
              activeTab === t.key ? "border-yellow-400 text-black" : "border-transparent text-gray-400 hover:text-gray-700"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: EXTRATO ── */}
      {activeTab === "extrato" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lançamento..."
                className="w-full pl-8 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
              <option value="todos">Tipo: Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
              <option value="todos">Status: Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}
              className="text-sm border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
              <option value="">Cliente: Todos</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000]">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">Nenhum lançamento encontrado</p>
                <button onClick={openNew} className="mt-3 text-sm text-yellow-600 font-bold hover:underline">Adicionar primeiro lançamento</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Vencimento</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Valor</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((e) => {
                      const cli = clients.find((c) => c.id === e.clientId);
                      const isOverdue = e.status !== "pago" && e.status !== "cancelado" && e.dueDate && new Date(e.dueDate + "T12:00:00") < today;
                      return (
                        <tr key={e.id} className="hover:bg-gray-50 group transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {e.type === "receita"
                                ? <ArrowUpRight size={14} className="text-green-500 flex-shrink-0" />
                                : <ArrowDownRight size={14} className="text-red-500 flex-shrink-0" />}
                              <span className="font-medium text-gray-900">{e.description}</span>
                              {e.recurrent && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Recorrente</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", catColor(e.category))}>{catLabel(e.category)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{cli?.name ?? "—"}</td>
                          <td className={cn("px-4 py-3 font-medium", isOverdue ? "text-red-600" : "text-gray-700")}>
                            {fmtDate(e.dueDate)}
                          </td>
                          <td className={cn("px-4 py-3 text-right font-black", e.type === "receita" ? "text-green-700" : "text-red-600")}>
                            {e.type === "receita" ? "+" : "-"}{formatCurrency(e.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATUS_STYLES[e.status])}>
                              {STATUS_LABELS[e.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              {e.status !== "pago" && e.status !== "cancelado" && (
                                <button onClick={() => handleMarkPaid(e)} title="Marcar como pago"
                                  className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              <button onClick={() => openEdit(e)}
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDelete(e.id)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: DESPESAS ── */}
      {activeTab === "despesas" && (
        <div className="space-y-4">
          {/* Resumo por categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {despesasPorCategoria.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl border-2 border-black p-12 text-center shadow-[3px_3px_0px_#000]">
                <TrendingDown size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">Nenhuma despesa lançada ainda</p>
                <button onClick={() => { setModal({ ...EMPTY, type: "despesa", category: "salario" }); setIsEditing(false); }}
                  className="mt-3 text-sm text-yellow-600 font-bold hover:underline">
                  Adicionar primeira despesa
                </button>
              </div>
            ) : despesasPorCategoria.map(([key, cat]) => {
              const total = cat.total + cat.pendente;
              const paidPct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
              return (
                <div key={key} className="bg-white rounded-xl border-2 border-black p-5 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", cat.color)}>{cat.label}</span>
                      <p className="text-xs text-gray-400 mt-1">{cat.count} lançamento(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">{formatCurrency(total)}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(cat.total)} pago</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">{paidPct}% pago</span>
                    {cat.pendente > 0 && <span className="text-xs text-yellow-600 font-semibold">{formatCurrency(cat.pendente)} pendente</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabela de despesas detalhada */}
          <div className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b-2 border-gray-100">
              <span className="text-sm font-black">Todos os lançamentos de despesa</span>
              <button onClick={() => { setModal({ ...EMPTY, type: "despesa", category: "salario" }); setIsEditing(false); }}
                className="flex items-center gap-1.5 text-xs font-bold bg-black text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                <Plus size={12} /> Nova Despesa
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Vencimento</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Valor</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.filter((e) => e.type === "despesa").sort((a, b) => {
                    const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    return db - da;
                  }).map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{e.description}</p>
                        {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", catColor(e.category))}>{catLabel(e.category)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(e.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-black text-red-600">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", STATUS_STYLES[e.status])}>
                          {STATUS_LABELS[e.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {e.status !== "pago" && (
                            <button onClick={() => handleMarkPaid(e)}
                              className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(e)}
                            className="p-1.5 rounded-md hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(e.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.filter((e) => e.type === "despesa").length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">Nenhuma despesa lançada</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PREVISÃO ── */}
      {activeTab === "previsao" && (
        <div className="space-y-4">
          {previsao.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-black p-12 text-center shadow-[3px_3px_0px_#000]">
              <Calendar size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-400">Nenhum lançamento pendente com vencimento definido</p>
            </div>
          ) : previsao.map(([month, data]) => (
            <div key={month} className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b-2 border-gray-100">
                <span className="font-black text-sm capitalize">{data.label}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-700 font-bold">Receita: {formatCurrency(data.receita)}</span>
                  <span className="text-red-600 font-bold">Despesa: {formatCurrency(data.despesa)}</span>
                  <span className={cn("font-black", data.receita - data.despesa >= 0 ? "text-gray-900" : "text-red-700")}>
                    Saldo: {formatCurrency(data.receita - data.despesa)}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {data.entries.map((e) => {
                  const cli = clients.find((c) => c.id === e.clientId);
                  return (
                    <div key={e.id} className="flex items-center px-5 py-3 gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{e.description}</p>
                        {cli && <p className="text-xs text-gray-400">{cli.name}</p>}
                      </div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", catColor(e.category))}>{catLabel(e.category)}</span>
                      <span className="text-xs text-gray-500">{fmtDate(e.dueDate)}</span>
                      <span className={cn("font-black text-sm", e.type === "receita" ? "text-green-700" : "text-red-600")}>
                        {e.type === "receita" ? "+" : "-"}{formatCurrency(e.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: INADIMPLÊNCIA ── */}
      {activeTab === "inadimplencia" && (
        <div className="space-y-4">
          {inadimplentes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-black p-12 text-center shadow-[3px_3px_0px_#000]">
              <CheckCircle2 size={32} className="mx-auto text-green-400 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Nenhum lançamento em atraso</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000]">
              <div className="px-5 py-3 bg-red-50 border-b-2 border-red-100 flex items-center justify-between">
                <span className="text-sm font-black text-red-700">{inadimplentes.length} lançamento(s) em atraso</span>
                <span className="text-sm font-black text-red-700">Total: {formatCurrency(totalAtrasado)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {inadimplentes.map((e) => {
                  const cli = clients.find((c) => c.id === e.clientId);
                  const diasAtraso = e.dueDate
                    ? Math.floor((today.getTime() - new Date(e.dueDate + "T12:00:00").getTime()) / 86400000)
                    : 0;
                  return (
                    <div key={e.id} className="flex items-center px-5 py-4 gap-4 group">
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{e.description}</p>
                        <p className="text-xs text-gray-400">{cli?.name ?? "Sem cliente"} &bull; Venceu em {fmtDate(e.dueDate)} ({diasAtraso}d)</p>
                      </div>
                      <span className="font-black text-sm text-red-700">{formatCurrency(e.amount)}</span>
                      <button onClick={() => handleMarkPaid(e)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all">
                        Marcar Pago
                      </button>
                      <button onClick={() => openEdit(e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-700 transition-all">
                        <Pencil size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: POR CLIENTE ── */}
      {activeTab === "porcliente" && (
        <div className="space-y-3">
          {porCliente.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-black p-12 text-center shadow-[3px_3px_0px_#000]">
              <Users size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-400">Nenhum lançamento vinculado a clientes</p>
            </div>
          ) : porCliente.map(([clientId, data]) => (
            <div key={clientId} className="bg-white rounded-xl border-2 border-black p-5 shadow-[3px_3px_0px_#000] flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-black">{data.name[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-gray-900">{data.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {data.receita > 0 && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">Receita: {formatCurrency(data.receita)}</span>}
                  {data.pendente > 0 && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Pendente: {formatCurrency(data.pendente)}</span>}
                  {data.atrasado > 0 && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">Atrasado: {formatCurrency(data.atrasado)}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total recebido</p>
                <p className="text-xl font-black text-gray-900">{formatCurrency(data.receita)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EntryModal
          initial={modal}
          clients={clients}
          projects={projects}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
