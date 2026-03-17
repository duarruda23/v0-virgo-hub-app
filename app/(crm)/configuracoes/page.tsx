"use client";
import { useState } from "react";
import { Save, Bell, Shield, Palette, Building2, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

type Tab = "agencia" | "notificacoes" | "permissoes" | "aparencia";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "agencia", label: "Agência", icon: <Building2 size={15} /> },
  { id: "notificacoes", label: "Notificações", icon: <Bell size={15} /> },
  { id: "permissoes", label: "Permissões", icon: <Shield size={15} /> },
  { id: "aparencia", label: "Aparência", icon: <Palette size={15} /> },
];

export default function ConfiguracoesPage() {
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("agencia");
  const [saved, setSaved] = useState(false);

  const [agency, setAgency] = useState({
    name: "Virgo Hub", email: "contato@virgohub.com.br", phone: "(11) 99999-0000",
    website: "virgohub.com.br", cnpj: "12.345.678/0001-90",
    address: "Av. Paulista, 1000 — São Paulo/SP",
  });

  const [notifications, setNotifications] = useState({
    newLead: true, taskDue: true, projectStatus: true, deliveryLate: true,
    weeklyReport: false, newClient: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border border-gray-200 rounded-xl overflow-hidden bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
              activeTab === tab.id ? "bg-black text-yellow-400" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Agência */}
      {activeTab === "agencia" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">Dados da Agência</p>
            <p className="text-xs text-gray-400 mt-0.5">Informações gerais exibidas em relatórios e documentos</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormLabel>Nome da Agência</FormLabel>
                <FormInput value={agency.name} onChange={(v) => setAgency((p) => ({ ...p, name: v }))} />
              </div>
              <div>
                <FormLabel>Email de Contato</FormLabel>
                <FormInput value={agency.email} onChange={(v) => setAgency((p) => ({ ...p, email: v }))} type="email" />
              </div>
              <div>
                <FormLabel>Telefone</FormLabel>
                <FormInput value={agency.phone} onChange={(v) => setAgency((p) => ({ ...p, phone: v }))} />
              </div>
              <div>
                <FormLabel>Site</FormLabel>
                <FormInput value={agency.website} onChange={(v) => setAgency((p) => ({ ...p, website: v }))} />
              </div>
              <div>
                <FormLabel>CNPJ</FormLabel>
                <FormInput value={agency.cnpj} onChange={(v) => setAgency((p) => ({ ...p, cnpj: v }))} />
              </div>
              <div className="col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormInput value={agency.address} onChange={(v) => setAgency((p) => ({ ...p, address: v }))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificações */}
      {activeTab === "notificacoes" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">Preferências de Notificação</p>
            <p className="text-xs text-gray-400 mt-0.5">Escolha quais eventos geram notificações no sistema</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { key: "newLead", label: "Novo lead recebido", desc: "Notificar quando um novo lead entrar no CRM" },
              { key: "taskDue", label: "Tarefa vencendo", desc: "Alertar quando uma tarefa estiver próxima do prazo" },
              { key: "projectStatus", label: "Mudança de status de projeto", desc: "Notificar quando o status de um projeto mudar" },
              { key: "deliveryLate", label: "Entrega atrasada", desc: "Alertar quando uma entrega passar do prazo" },
              { key: "newClient", label: "Novo cliente convertido", desc: "Notificar quando um lead for convertido em cliente" },
              { key: "weeklyReport", label: "Relatório semanal por email", desc: "Receber resumo semanal de métricas por email" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    notifications[key as keyof typeof notifications] ? "bg-black" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    notifications[key as keyof typeof notifications] ? "left-6" : "left-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissões */}
      {activeTab === "permissoes" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="font-bold text-gray-900">Matriz de Permissões</p>
              <p className="text-xs text-gray-400 mt-0.5">Visão geral do que cada papel pode fazer no sistema</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Recurso</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-yellow-700 uppercase tracking-wide">Admin</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wide">Líder</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Colaborador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { resource: "Dashboard", admin: true, leader: true, collaborator: true },
                    { resource: "CRM / Pipeline — Ver", admin: true, leader: true, collaborator: true },
                    { resource: "CRM / Pipeline — Editar", admin: true, leader: true, collaborator: false },
                    { resource: "Clientes — Ver", admin: true, leader: true, collaborator: true },
                    { resource: "Clientes — Criar/Editar", admin: true, leader: true, collaborator: false },
                    { resource: "Projetos — Ver", admin: true, leader: true, collaborator: true },
                    { resource: "Projetos — Gerenciar", admin: true, leader: true, collaborator: false },
                    { resource: "Entregas", admin: true, leader: true, collaborator: true },
                    { resource: "Produtos", admin: true, leader: true, collaborator: false },
                    { resource: "Tarefas", admin: true, leader: true, collaborator: true },
                    { resource: "Equipe — Ver", admin: true, leader: true, collaborator: false },
                    { resource: "Equipe — Gerenciar", admin: true, leader: false, collaborator: false },
                    { resource: "Relatórios", admin: true, leader: true, collaborator: false },
                    { resource: "Configurações", admin: true, leader: false, collaborator: false },
                  ].map((row) => (
                    <tr key={row.resource}>
                      <td className="px-6 py-3 text-sm text-gray-700 font-medium">{row.resource}</td>
                      <td className="px-4 py-3 text-center">
                        {row.admin ? <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs inline-flex items-center justify-center font-bold">✓</span>
                          : <span className="w-5 h-5 rounded-full bg-red-50 text-red-400 text-xs inline-flex items-center justify-center">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.leader ? <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs inline-flex items-center justify-center font-bold">✓</span>
                          : <span className="w-5 h-5 rounded-full bg-red-50 text-red-400 text-xs inline-flex items-center justify-center">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.collaborator ? <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs inline-flex items-center justify-center font-bold">✓</span>
                          : <span className="w-5 h-5 rounded-full bg-red-50 text-red-400 text-xs inline-flex items-center justify-center">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current user */}
          {currentUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-black text-black text-sm flex-shrink-0">
                {currentUser.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Você está logado como <span className="text-yellow-700">{currentUser.name}</span></p>
                <p className="text-xs text-gray-500">Papel atual: <span className="font-semibold capitalize">{currentUser.role === "admin" ? "Administrador" : currentUser.role === "leader" ? "Líder" : "Colaborador"}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aparência */}
      {activeTab === "aparencia" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">Aparência do Sistema</p>
            <p className="text-xs text-gray-400 mt-0.5">Personalize a aparência visual do Virgo Hub</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Tema da Sidebar</p>
              <div className="flex gap-3">
                {[
                  { label: "Preto (Atual)", preview: "bg-black", active: true },
                  { label: "Grafite", preview: "bg-gray-700", active: false },
                  { label: "Azul-marinho", preview: "bg-blue-900", active: false },
                ].map((t) => (
                  <div key={t.label} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    t.active ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300")}>
                    <div className={cn("w-12 h-16 rounded-lg", t.preview)} />
                    <p className="text-xs font-medium text-gray-600">{t.label}</p>
                    {t.active && <span className="text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded">Ativo</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Cor de Destaque</p>
              <div className="flex gap-3">
                {[
                  { label: "Amarelo", color: "bg-yellow-400", active: true },
                  { label: "Azul", color: "bg-blue-500", active: false },
                  { label: "Verde", color: "bg-green-500", active: false },
                  { label: "Coral", color: "bg-orange-400", active: false },
                ].map((c) => (
                  <div key={c.label} className={cn("flex flex-col items-center gap-2 cursor-pointer")}>
                    <div className={cn("w-10 h-10 rounded-full border-4 transition-all", c.color, c.active ? "border-gray-900 scale-110" : "border-transparent")} />
                    <p className="text-[10px] text-gray-500">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Densidade de Layout</p>
              <div className="flex gap-2">
                {["Compacto", "Padrão", "Espaçoso"].map((d, i) => (
                  <button key={d} className={cn("px-4 py-2 text-sm rounded-lg border font-medium transition-all",
                    i === 1 ? "bg-black text-yellow-400 border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
            saved ? "bg-green-500 text-white" : "bg-black text-yellow-400 hover:bg-gray-800"
          )}
        >
          {saved ? <><CheckCircle size={15} /> Salvo!</> : <><Save size={15} /> Salvar Alterações</>}
        </button>
      </div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{children}</label>;
}

function FormInput({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white"
    />
  );
}
