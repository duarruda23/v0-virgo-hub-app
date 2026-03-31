"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Settings2,
  Video, Palette, Globe, FileText, Plus, X, Check, Search,
  CalendarDays, Users, BarChart3, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePauta, useClients, useUsers,
  upsertPautaItem, upsertPautaConfig, togglePautaItem,
  type PautaDeliveryType, type PautaItem, type PautaClientConfig,
} from "@/hooks/use-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CAT_ICON: Record<string, React.ReactNode> = {
  video:   <Video size={11} />,
  design:  <Palette size={11} />,
  content: <FileText size={11} />,
  general: <Check size={11} />,
};

const CAT_COLOR: Record<string, string> = {
  video:   "bg-purple-100 text-purple-700 border-purple-200",
  design:  "bg-pink-100 text-pink-700 border-pink-200",
  content: "bg-blue-100 text-blue-700 border-blue-200",
  general: "bg-gray-100 text-gray-600 border-gray-200",
};

// Gera tipos relevantes para um cliente com base na config
function getRelevantTypes(
  allTypes: PautaDeliveryType[],
  config: PautaClientConfig | undefined
): PautaDeliveryType[] {
  if (!config) return allTypes.filter(t => ["Planejamento","Aprovação Planej.","Marcação Gravação","Gravação","Upload no Drive"].includes(t.name));

  const fixed = allTypes.filter(t =>
    ["Planejamento","Aprovação Planej.","Marcação Gravação","Gravação","Upload no Drive"].includes(t.name)
  );

  const videos = allTypes
    .filter(t => t.category === "video" && t.name.startsWith("Edição Vídeo"))
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, config.qty_videos);

  const designs = allTypes
    .filter(t => t.category === "design" && t.name.startsWith("Design Arte"))
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, config.qty_designs);

  const lp = config.has_landing_page ? allTypes.filter(t => t.name === "Landing Page") : [];

  const extra = allTypes.filter(t =>
    ["Revisão","Aprovação Final","Programação","Mês Finalizado"].includes(t.name)
  );

  return [...fixed, ...videos, ...designs, ...lp, ...extra];
}

// ─── Config Modal ─────────────────────────────────────────────────────────────
function ConfigModal({
  clientName, config, pautaMonthId, clientId, onClose
}: {
  clientName: string;
  config?: PautaClientConfig;
  pautaMonthId: string;
  clientId: string;
  onClose: () => void;
}) {
  const [videos, setVideos] = useState(config?.qty_videos ?? 0);
  const [designs, setDesigns] = useState(config?.qty_designs ?? 0);
  const [lp, setLp] = useState(config?.has_landing_page ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await upsertPautaConfig({ pautaMonthId, clientId, qtyVideos: videos, qtyDesigns: designs, hasLandingPage: lp });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white border-2 border-black rounded-xl shadow-[6px_6px_0px_#000] w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
          <div>
            <h3 className="font-black text-sm">Configurar Pauta</h3>
            <p className="text-xs text-gray-500 mt-0.5">{clientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"><X size={16} /></button>
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Vídeos */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              <Video size={13} className="text-purple-600" /> Quantidade de Vídeos
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setVideos(v => Math.max(0, v - 1))}
                className="w-8 h-8 rounded-lg border-2 border-black font-black flex items-center justify-center hover:bg-yellow-400 transition-colors">-</button>
              <span className="text-2xl font-black w-10 text-center">{videos}</span>
              <button onClick={() => setVideos(v => Math.min(8, v + 1))}
                className="w-8 h-8 rounded-lg border-2 border-black font-black flex items-center justify-center hover:bg-yellow-400 transition-colors">+</button>
            </div>
          </div>
          {/* Designs */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              <Palette size={13} className="text-pink-600" /> Quantidade de Designs
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setDesigns(d => Math.max(0, d - 1))}
                className="w-8 h-8 rounded-lg border-2 border-black font-black flex items-center justify-center hover:bg-yellow-400 transition-colors">-</button>
              <span className="text-2xl font-black w-10 text-center">{designs}</span>
              <button onClick={() => setDesigns(d => Math.min(8, d + 1))}
                className="w-8 h-8 rounded-lg border-2 border-black font-black flex items-center justify-center hover:bg-yellow-400 transition-colors">+</button>
            </div>
          </div>
          {/* Landing Page */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              <Globe size={13} className="text-green-600" /> Landing Page
            </label>
            <button onClick={() => setLp(v => !v)}
              className={cn("w-full py-2.5 rounded-lg border-2 font-bold text-sm transition-colors",
                lp ? "border-green-500 bg-green-500 text-white" : "border-gray-200 text-gray-500 hover:border-gray-400"
              )}>
              {lp ? "Incluída" : "Não incluída"}
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-400 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-lg border-2 border-black bg-black text-yellow-400 text-sm font-black hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cell ─────────────────────────────────────────────────────────────────────
function PautaCell({
  type, item, pautaMonthId, clientId, onMutate
}: {
  type: PautaDeliveryType;
  item?: PautaItem;
  pautaMonthId: string;
  clientId: string;
  onMutate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const newVal = !item?.is_completed;
    if (item) {
      await togglePautaItem(item.id, newVal);
    } else {
      await upsertPautaItem({ pautaMonthId, clientId, deliveryTypeId: type.id, isCompleted: newVal });
    }
    onMutate();
    setLoading(false);
  }

  const done = item?.is_completed ?? false;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={type.name}
      className={cn(
        "w-full h-9 rounded-lg border-2 flex items-center justify-center transition-all text-xs font-bold gap-1.5",
        done
          ? "bg-green-500 border-green-600 text-white shadow-[1px_1px_0px_#16a34a]"
          : "bg-white border-gray-200 text-gray-400 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50",
        loading && "opacity-60 cursor-wait"
      )}
    >
      {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    </button>
  );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({
  client, types, items, configs, pautaMonthId, onConfig, onMutate
}: {
  client: { id: string; name: string; company?: string };
  types: PautaDeliveryType[];
  items: PautaItem[];
  configs: PautaClientConfig[];
  pautaMonthId: string;
  onConfig: () => void;
  onMutate: () => void;
}) {
  const config = configs.find(c => c.client_id === client.id);
  const relevantTypes = getRelevantTypes(types, config);
  const clientItems = items.filter(i => i.client_id === client.id);
  const done = clientItems.filter(i => i.is_completed).length;
  const total = relevantTypes.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] transition-all">
      {/* Header do cliente */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-black text-yellow-400">
            {client.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-xs text-gray-900 truncate">{client.name}</p>
          {client.company && <p className="text-[10px] text-gray-400 truncate">{client.company}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded",
            pct === 100 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
          )}>{pct}%</span>
          <button onClick={onConfig}
            className="p-1 rounded hover:bg-yellow-100 text-gray-400 hover:text-yellow-700 transition-colors">
            <Settings2 size={13} />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-gray-100">
        <div className={cn("h-full transition-all", pct === 100 ? "bg-green-500" : "bg-yellow-400")}
          style={{ width: `${pct}%` }} />
      </div>

      {/* Grid de células */}
      <div className="p-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(relevantTypes.length, 6)}, 1fr)` }}>
        {relevantTypes.map((type) => (
          <div key={type.id}>
            <p className="text-[9px] text-gray-400 text-center mb-0.5 leading-tight truncate">{type.name.replace("Edição ","").replace("Design ","")}</p>
            <PautaCell
              type={type}
              item={clientItems.find(i => i.delivery_type_id === type.id)}
              pautaMonthId={pautaMonthId}
              clientId={client.id}
              onMutate={onMutate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PautaPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [configClient, setConfigClient] = useState<{ id: string; name: string } | null>(null);

  const { pauta, isLoading, mutate } = usePauta(month, year);
  const { clients } = useClients();
  const { users } = useUsers();

  const activeClients = useMemo(() =>
    clients.filter(c => c.status === "ativo" || c.status === "prospecto").filter(c =>
      !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase())
    ), [clients, search]
  );

  // KPIs
  const totalItems = pauta?.items.length ?? 0;
  const doneItems = pauta?.items.filter(i => i.is_completed).length ?? 0;
  const globalPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const fullClients = useMemo(() => {
    if (!pauta) return 0;
    return activeClients.filter(c => {
      const config = pauta.configs.find(cfg => cfg.client_id === c.id);
      const types = getRelevantTypes(pauta.deliveryTypes, config);
      const done = pauta.items.filter(i => i.client_id === c.id && i.is_completed).length;
      return types.length > 0 && done === types.length;
    }).length;
  }, [pauta, activeClients]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const configClientData = configClient
    ? clients.find(c => c.id === configClient.id)
    : null;

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pauta de Entregas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle mensal de entregas por cliente</p>
        </div>

        {/* Navegação de mês */}
        <div className="flex items-center gap-2 border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000] bg-white">
          <button onClick={prevMonth} className="px-3 py-2.5 hover:bg-yellow-400 transition-colors border-r border-gray-200">
            <ChevronLeft size={16} />
          </button>
          <div className="px-5 py-2 text-center min-w-[160px]">
            <p className="font-black text-sm text-gray-900">{MONTHS[month - 1]}</p>
            <p className="text-xs text-gray-400">{year}</p>
          </div>
          <button onClick={nextMonth} className="px-3 py-2.5 hover:bg-yellow-400 transition-colors border-l border-gray-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Clientes Ativos", value: activeClients.length.toString(), icon: <Users size={16} />, color: "bg-blue-100 text-blue-700" },
          { label: "Entregas Feitas", value: `${doneItems}/${totalItems}`, icon: <CheckCircle2 size={16} />, color: "bg-green-100 text-green-700" },
          { label: "Progresso Geral", value: `${globalPct}%`, icon: <BarChart3 size={16} />, color: "bg-yellow-100 text-yellow-700" },
          { label: "Clientes Concluídos", value: `${fullClients}/${activeClients.length}`, icon: <CalendarDays size={16} />, color: "bg-purple-100 text-purple-700" },
        ].map((k) => (
          <div key={k.label} className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_#000]">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", k.color)}>
              {k.icon}
            </div>
            <p className="text-xl font-black text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Barra de progresso global */}
      <div className="bg-white border-2 border-black rounded-xl px-5 py-4 shadow-[2px_2px_0px_#000]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Progresso do Mês — {MONTHS[month - 1]} {year}</span>
          <span className="text-sm font-black text-gray-900">{globalPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className={cn("h-full rounded-full transition-all duration-500", globalPct === 100 ? "bg-green-500" : "bg-yellow-400")}
            style={{ width: `${globalPct}%` }} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
            className="w-full pl-8 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-white" />
        </div>
        {search && (
          <button onClick={() => setSearch("")}
            className="px-3 py-2 text-xs border-2 border-gray-200 rounded-lg hover:border-gray-400 text-gray-500 font-bold transition-colors">
            Limpar
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {/* Legenda de categorias */}
          {(["general","video","design","content"] as const).map(cat => (
            <span key={cat} className={cn("hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border", CAT_COLOR[cat])}>
              {CAT_ICON[cat]}
              {{general:"Geral",video:"Vídeo",design:"Design",content:"Conteúdo"}[cat]}
            </span>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm font-medium">Carregando pauta...</span>
        </div>
      )}

      {/* Grid de clientes */}
      {!isLoading && pauta && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeClients.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">
              Nenhum cliente ativo encontrado
            </div>
          ) : activeClients.map(client => (
            <ClientRow
              key={client.id}
              client={client}
              types={pauta.deliveryTypes}
              items={pauta.items}
              configs={pauta.configs}
              pautaMonthId={pauta.month.id}
              onConfig={() => setConfigClient({ id: client.id, name: client.name })}
              onMutate={mutate}
            />
          ))}
        </div>
      )}

      {/* Config Modal */}
      {configClient && pauta && (
        <ConfigModal
          clientName={configClientData?.name ?? configClient.name}
          config={pauta.configs.find(c => c.client_id === configClient.id)}
          pautaMonthId={pauta.month.id}
          clientId={configClient.id}
          onClose={() => setConfigClient(null)}
        />
      )}
    </div>
  );
}
