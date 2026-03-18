"use client";
import { useState, useMemo } from "react";
import { Plus, X, Search, Phone, Mail, Globe, Building2, Pencil, Trash2, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients, createClient, updateClient, deleteClient, useUsers, useProjects } from "@/hooks/use-data";
import type { Client, ClientStatus, ClientTier } from "@/lib/types";
import {
  CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_TIER_LABELS, CLIENT_TIER_COLORS,
  formatCurrency, formatDate, getInitials, generateId
} from "@/lib/utils-crm";

const EMPTY: Omit<Client, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", company: "", cnpj: "", website: "",
  tradeName: "", stateRegistration: "", municipalRegistration: "",
  taxRegime: "", legalNature: "", foundingDate: "",
  status: "ativo", tier: "standard", segment: "", responsibleId: "",
  city: "", notes: "", tags: [], mrr: 0,
};

type SortKey = "name" | "mrr" | "status" | "createdAt";

export default function ClientesPage() {
  const { clients } = useClients();
  const { users } = useUsers();
  const { projects } = useProjects();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "todos">("todos");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<Partial<Client> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detail, setDetail] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    let list = [...clients];
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "todos") list = list.filter((c) => c.status === statusFilter);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "mrr") cmp = a.mrr - b.mrr;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [clients, search, statusFilter, sortKey, sortAsc]);

  const totalMRR = useMemo(() => clients.filter((c) => c.status === "ativo").reduce((s, c) => s + c.mrr, 0), [clients]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleSave = async () => {
    if (!modal?.name || !modal?.email) return;
    // Garante que responsibleId nunca é um ID inexistente
    const responsibleId = modal.responsibleId && modal.responsibleId !== "u1"
      ? modal.responsibleId
      : (users[0]?.id ?? null);
    if (isEditing && modal.id) {
      await updateClient(modal.id, { ...modal, responsibleId: responsibleId ?? undefined });
    } else {
      await createClient({ ...EMPTY, ...modal, responsibleId: responsibleId ?? "" });
    }
    setModal(null);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["ativo", "inativo", "prospecto", "churned"] as ClientStatus[]).map((s) => {
          const count = clients.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "todos" : s)}
              className={cn("bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm", statusFilter === s ? "border-yellow-400 shadow-sm" : "border-gray-200")}
            >
              <p className="text-2xl font-black text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{CLIENT_STATUS_LABELS[s]}</p>
              {s === "ativo" && <p className="text-xs font-semibold text-green-600 mt-1">{formatCurrency(totalMRR)}/mês</p>}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-full focus:outline-none focus:border-yellow-400"
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "ativo", "inativo", "prospecto"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === "todos" ? "todos" : s as ClientStatus)}
              className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                statusFilter === s ? "bg-black text-yellow-400" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {s === "todos" ? "Todos" : CLIENT_STATUS_LABELS[s as ClientStatus]}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setModal({ ...EMPTY, responsibleId: users[0]?.id ?? "" }); setIsEditing(false); }}
          className="ml-auto flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} /> Novo Cliente
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <Th onClick={() => toggleSort("name")}>Cliente <SortIcon k="name" /></Th>
                <Th>Contato</Th>
                <Th>Tier</Th>
                <Th onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></Th>
                <Th onClick={() => toggleSort("mrr")}>MRR <SortIcon k="mrr" /></Th>
                <Th>Responsável</Th>
                <Th onClick={() => toggleSort("createdAt")}>Criado <SortIcon k="createdAt" /></Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">Nenhum cliente encontrado</td></tr>
              )}
              {filtered.map((client) => {
                const responsible = users.find((u) => u.id === client.responsibleId);
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetail(client)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-yellow-400">{getInitials(client.name)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          {client.company && <p className="text-xs text-gray-400">{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-500"><Mail size={10} /> {client.email}</div>
                        {client.phone && <div className="flex items-center gap-1 text-xs text-gray-400"><Phone size={10} /> {client.phone}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded font-semibold", CLIENT_TIER_COLORS[client.tier])}>
                        {CLIENT_TIER_LABELS[client.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", CLIENT_STATUS_COLORS[client.status])}>
                        {CLIENT_STATUS_LABELS[client.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{client.mrr > 0 ? formatCurrency(client.mrr) : "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {responsible ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-gray-600">{getInitials(responsible.name)}</span>
                          </div>
                          <span className="text-xs text-gray-600 hidden lg:block">{responsible.name.split(" ")[0]}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(client.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setModal({ ...client }); setIsEditing(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteClient(client.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-gray-900">{detail.name}</h2>
                {detail.company && <p className="text-xs text-gray-400">{detail.company}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setModal({ ...detail }); setIsEditing(true); setDetail(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Pencil size={15} /></button>
                <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={15} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-semibold", CLIENT_STATUS_COLORS[detail.status])}>{CLIENT_STATUS_LABELS[detail.status]}</span>
                <span className={cn("text-xs px-2.5 py-1 rounded font-semibold", CLIENT_TIER_COLORS[detail.tier])}>{CLIENT_TIER_LABELS[detail.tier]}</span>
              </div>
              {detail.mrr > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
                  <TrendingUp size={20} className="text-yellow-600" />
                  <div>
                    <p className="text-xs text-yellow-700 font-medium">MRR</p>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(detail.mrr)}/mês</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contato</p>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400" /> {detail.email}</div>
                {detail.phone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" /> {detail.phone}</div>}
                {detail.website && <div className="flex items-center gap-2 text-sm text-gray-700"><Globe size={14} className="text-gray-400" /> {detail.website}</div>}
                {detail.city && <div className="flex items-center gap-2 text-sm text-gray-700"><Building2 size={14} className="text-gray-400" /> {detail.city}</div>}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Projetos</p>
                {projects.filter((p) => p.clientId === detail.id).length === 0
                  ? <p className="text-xs text-gray-400">Nenhum projeto</p>
                  : projects.filter((p) => p.clientId === detail.id).map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-2 flex-shrink-0">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
              {detail.notes && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Observações</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{detail.notes}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Cliente desde {formatDate(detail.createdAt)}</p>
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
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Cliente" : "Novo Cliente"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto">
              <div className="col-span-2"><FormLabel>Nome *</FormLabel><FormInput value={modal.name ?? ""} onChange={(v) => setModal((p) => ({ ...p, name: v }))} /></div>
              <div><FormLabel>Email *</FormLabel><FormInput value={modal.email ?? ""} onChange={(v) => setModal((p) => ({ ...p, email: v }))} /></div>
              <div><FormLabel>Telefone</FormLabel><FormInput value={modal.phone ?? ""} onChange={(v) => setModal((p) => ({ ...p, phone: v }))} /></div>
              <div><FormLabel>Empresa</FormLabel><FormInput value={modal.company ?? ""} onChange={(v) => setModal((p) => ({ ...p, company: v }))} /></div>
              <div><FormLabel>Cidade</FormLabel><FormInput value={modal.city ?? ""} onChange={(v) => setModal((p) => ({ ...p, city: v }))} /></div>
              <div><FormLabel>CNPJ</FormLabel><FormInput value={modal.cnpj ?? ""} onChange={(v) => setModal((p) => ({ ...p, cnpj: v }))} /></div>
              <div><FormLabel>Website</FormLabel><FormInput value={modal.website ?? ""} onChange={(v) => setModal((p) => ({ ...p, website: v }))} /></div>
              <div><FormLabel>MRR (R$)</FormLabel><FormInput value={String(modal.mrr ?? 0)} onChange={(v) => setModal((p) => ({ ...p, mrr: Number(v) }))} type="number" /></div>
              <div><FormLabel>Segmento</FormLabel><FormInput value={modal.segment ?? ""} onChange={(v) => setModal((p) => ({ ...p, segment: v }))} /></div>
              <div>
                <FormLabel>Status</FormLabel>
                <select value={modal.status ?? "ativo"} onChange={(e) => setModal((p) => ({ ...p, status: e.target.value as ClientStatus }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                  {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((s) => <option key={s} value={s}>{CLIENT_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Tier</FormLabel>
                <select value={modal.tier ?? "standard"} onChange={(e) => setModal((p) => ({ ...p, tier: e.target.value as ClientTier }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                  {(Object.keys(CLIENT_TIER_LABELS) as ClientTier[]).map((s) => <option key={s} value={s}>{CLIENT_TIER_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <FormLabel>Responsável</FormLabel>
                <select value={modal.responsibleId ?? "u1"} onChange={(e) => setModal((p) => ({ ...p, responsibleId: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2"><FormLabel>Observações</FormLabel>
                <textarea value={modal.notes ?? ""} onChange={(e) => setModal((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={!modal.name || !modal.email} className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
                {isEditing ? "Salvar" : "Criar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <th onClick={onClick} className={cn("text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap", onClick && "cursor-pointer hover:text-gray-700 select-none")}>
      <div className="flex items-center gap-1">{children}</div>
    </th>
  );
}
function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>;
}
function FormInput({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string; }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors" />;
}
