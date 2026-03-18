"use client";
import { useState, useMemo } from "react";
import { Plus, X, Pencil, Trash2, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, createProduct, updateProduct, deleteProduct } from "@/hooks/use-data";
import type { Product, ProductCategory, BillingCycle } from "@/lib/types";
import { PRODUCT_CATEGORY_LABELS, BILLING_CYCLE_LABELS, formatCurrency, generateId } from "@/lib/utils-crm";

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  gestao_social: "bg-blue-100 text-blue-800",
  trafego_pago: "bg-orange-100 text-orange-800",
  seo: "bg-green-100 text-green-800",
  design: "bg-purple-100 text-purple-800",
  video: "bg-red-100 text-red-800",
  consultoria: "bg-yellow-100 text-yellow-800",
  outro: "bg-gray-100 text-gray-700",
};

const EMPTY: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  name: "", description: "", category: "gestao_social",
  price: 0, billingCycle: "mensal", active: true, deliverables: [],
};

export default function ProdutosPage() {
  const { products } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "todos">("todos");
  const [activeFilter, setActiveFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [modal, setModal] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState("");

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryFilter !== "todos") list = list.filter((p) => p.category === categoryFilter);
    if (activeFilter === "ativo") list = list.filter((p) => p.active);
    if (activeFilter === "inativo") list = list.filter((p) => !p.active);
    return list;
  }, [products, categoryFilter, activeFilter]);

  const handleSave = async () => {
    if (!modal?.name) return;
    if (isEditing && modal.id) {
      await updateProduct(modal.id, modal);
    } else {
      await createProduct({ ...EMPTY, ...modal });
    }
    setModal(null);
  };

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setModal((p) => ({ ...p, deliverables: [...(p?.deliverables ?? []), newDeliverable.trim()] }));
    setNewDeliverable("");
  };

  const removeDeliverable = (i: number) => {
    setModal((p) => ({ ...p, deliverables: (p?.deliverables ?? []).filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategoryFilter("todos")} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", categoryFilter === "todos" ? "bg-black text-yellow-400 border-black" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>Todos</button>
          {(Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[]).map((c) => (
            <button key={c} onClick={() => setCategoryFilter(categoryFilter === c ? "todos" : c)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", categoryFilter === c ? "bg-black text-yellow-400 border-black" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>
              {PRODUCT_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(["todos", "ativo", "inativo"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize", activeFilter === f ? "bg-black text-yellow-400 border-black" : "bg-white border-gray-200 text-gray-600")}>
              {f === "todos" ? "Todos" : f === "ativo" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
        <button onClick={() => { setModal({ ...EMPTY }); setIsEditing(false); }} className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
          <Plus size={15} /> Novo Produto
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-gray-400">Nenhum produto encontrado</div>
        )}
        {filtered.map((product) => (
          <div key={product.id} className={cn("bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-sm transition-all group", product.active ? "border-gray-200" : "border-gray-200 opacity-60")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{product.name}</p>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold mt-1 inline-block", CATEGORY_COLORS[product.category])}>
                    {PRODUCT_CATEGORY_LABELS[product.category]}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setModal({ ...product }); setIsEditing(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil size={12} /></button>
                <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>

            {product.description && <p className="text-xs text-gray-500 leading-relaxed">{product.description}</p>}

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-400">{BILLING_CYCLE_LABELS[product.billingCycle]}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateProduct(product.id, { active: !product.active })}
                  className={cn("text-xs px-2.5 py-1 rounded-full font-semibold transition-colors", product.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                >
                  {product.active ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>

            {product.deliverables.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-1">
                {product.deliverables.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check size={10} className="text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{d}</span>
                  </div>
                ))}
                {product.deliverables.length > 3 && (
                  <p className="text-xs text-gray-400">+{product.deliverables.length - 3} itens</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
              <div><FormLabel>Nome *</FormLabel><FormInput value={modal.name ?? ""} onChange={(v) => setModal((p) => ({ ...p, name: v }))} /></div>
              <div><FormLabel>Descrição</FormLabel><textarea value={modal.description ?? ""} onChange={(e) => setModal((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Categoria</FormLabel>
                  <select value={modal.category ?? "gestao_social"} onChange={(e) => setModal((p) => ({ ...p, category: e.target.value as ProductCategory }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[]).map((c) => <option key={c} value={c}>{PRODUCT_CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Ciclo de Cobrança</FormLabel>
                  <select value={modal.billingCycle ?? "mensal"} onChange={(e) => setModal((p) => ({ ...p, billingCycle: e.target.value as BillingCycle }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map((c) => <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>)}
                  </select>
                </div>
                <div><FormLabel>Preço (R$)</FormLabel><FormInput value={String(modal.price ?? 0)} onChange={(v) => setModal((p) => ({ ...p, price: Number(v) }))} type="number" /></div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="active" checked={modal.active ?? true} onChange={(e) => setModal((p) => ({ ...p, active: e.target.checked }))} className="accent-yellow-400" />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Produto ativo</label>
                </div>
              </div>
              <div>
                <FormLabel>Entregáveis</FormLabel>
                <div className="flex gap-2 mb-2">
                  <input value={newDeliverable} onChange={(e) => setNewDeliverable(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDeliverable()} placeholder="Ex: 12 posts/mês" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" />
                  <button onClick={addDeliverable} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors">Add</button>
                </div>
                <div className="space-y-1.5">
                  {(modal.deliverables ?? []).map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-gray-700">{d}</span>
                      <button onClick={() => removeDeliverable(i)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={!modal.name} className="px-5 py-2 bg-black text-yellow-400 text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
                {isEditing ? "Salvar" : "Criar Produto"}
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
