"use client";
import { useState, useMemo } from "react";
import { Plus, X, Search, Mail, Phone, Shield, User, Users, Copy, Check, KeyRound, RefreshCw, Gauge, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers, createUser, updateUser, deleteUser, useTasks, useProjects, updateUserCapacity } from "@/hooks/use-data";
import type { User as UserType, Role } from "@/lib/types";
import { getInitials, generateId } from "@/lib/utils-crm";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  leader: "Líder",
  collaborator: "Colaborador",
};

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-yellow-100 text-yellow-800 border-yellow-200",
  leader: "bg-blue-100 text-blue-800 border-blue-200",
  collaborator: "bg-gray-100 text-gray-700 border-gray-200",
};

const ROLE_ICON_BG: Record<Role, string> = {
  admin: "bg-yellow-400",
  leader: "bg-blue-500",
  collaborator: "bg-gray-700",
};

const DEPARTMENTS = ["Gestão", "Tráfego Pago", "Design", "Conteúdo", "Social Media", "SEO", "Desenvolvimento"];

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

interface InviteConfirm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const EMPTY_USER: Omit<UserType, "id" | "createdAt"> = {
  name: "", email: "", phone: "", role: "collaborator",
  department: "Design", position: "", active: true,
};

export default function EquipePage() {
  const { users } = useUsers();
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const [activeTab, setActiveTab] = useState<"membros" | "capacidade">("membros");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [modal, setModal] = useState<(Partial<UserType> & { tempPassword?: string }) | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detail, setDetail] = useState<UserType | null>(null);
  const [inviteConfirm, setInviteConfirm] = useState<InviteConfirm | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [capacityEdit, setCapacityEdit] = useState<Record<string, number>>({});

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  }), [users, search, filterRole]);

  const openNew = () => {
    const tempPassword = generatePassword();
    setModal({ ...EMPTY_USER, tempPassword });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!modal?.name || !modal?.email) return;
    if (isEditing && modal.id) {
      await updateUser(modal.id, modal);
      setModal(null);
      setIsEditing(false);
    } else {
      const password = modal.tempPassword || generatePassword();
      await createUser({ ...EMPTY_USER, ...modal, password });
      setInviteConfirm({
        name: modal.name!,
        email: modal.email!,
        password,
        role: (modal.role as Role) ?? "collaborator",
      });
      setModal(null);
    }
  };

  const handleResetPassword = async () => {
    if (!detail || !resetPass) return;
    await updateUser(detail.id, { password: resetPass } as Partial<UserType>);
    setShowResetPass(false);
    setResetPass("");
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter((t) => t.assigneeId === userId && t.status !== "concluida");
    const userProjects = projects.filter((p) => p.managerId === userId || (p.teamIds ?? []).includes(userId));
    // Soma horas estimadas; tarefas sem estimativa contam 1h por padrão
    const estimatedHours = userTasks.reduce((sum, t) => sum + (t.estimatedHours ?? 1), 0);
    return { openTasks: userTasks.length, projects: userProjects.length, estimatedHours };
  };

  const roleCount = (role: Role) => users.filter((u) => u.role === role && u.active).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={16} />} label="Total de Membros" value={users.filter(u => u.active).length} color="bg-black text-yellow-400" />
        <StatCard icon={<Shield size={16} />} label="Administradores" value={roleCount("admin")} color="bg-yellow-400 text-black" />
        <StatCard icon={<User size={16} />} label="Líderes" value={roleCount("leader")} color="bg-blue-500 text-white" />
        <StatCard icon={<User size={16} />} label="Colaboradores" value={roleCount("collaborator")} color="bg-gray-700 text-white" />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 border-2 border-black rounded-lg overflow-hidden bg-white p-1 shadow-[2px_2px_0px_#000]">
          {([
            { key: "membros", label: "Membros", icon: <Users size={13} /> },
            { key: "capacidade", label: "Capacidade", icon: <Gauge size={13} /> },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn("flex items-center gap-1.5 text-xs px-4 py-2 rounded font-bold transition-colors",
                activeTab === t.key ? "bg-black text-yellow-400" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-gray-800 transition-colors">
          <Plus size={15} /> Convidar Membro
        </button>
      </div>

      {/* ── ABA: MEMBROS ── */}
      {activeTab === "membros" && (<>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar membro..."
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-56 focus:outline-none focus:border-yellow-400" />
        </div>
        <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white p-1">
          {(["all", "admin", "leader", "collaborator"] as const).map((r) => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={cn("text-xs px-3 py-1.5 rounded font-medium transition-colors",
                filterRole === r ? "bg-black text-yellow-400" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}>
              {r === "all" ? "Todos" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const stats = getUserStats(user.id);
          return (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setDetail(user)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", ROLE_ICON_BG[user.role])}>
                    <span className={cn("font-black text-sm", user.role === "admin" ? "text-black" : "text-white")}>
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.position || user.department}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-1 rounded-full border font-semibold flex-shrink-0",
                  user.active ? ROLE_COLORS[user.role] : "bg-gray-100 text-gray-400 border-gray-200"
                )}>
                  {user.active ? ROLE_LABELS[user.role] : "Inativo"}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={11} className="text-gray-400" /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={11} className="text-gray-400" /> {user.phone}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{user.department}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span><span className="font-bold text-gray-900">{stats.openTasks}</span> tarefas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span><span className="font-bold text-gray-900">{stats.activeProjects}</span> projetos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span><span className="font-bold text-gray-900">{stats.doneTasks}</span> concluídas</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            Nenhum membro encontrado
          </div>
        )}
      </div>
      </>)}

      {/* ── ABA: CAPACIDADE ── */}
      {activeTab === "capacidade" && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="px-5 py-3 bg-black flex items-center justify-between">
              <span className="text-sm font-black text-yellow-400">Capacidade de Produção por Membro</span>
              <span className="text-xs text-white/50">Clique para editar horas/dia</span>
            </div>
            <div className="divide-y divide-gray-100">
              {users.filter((u) => u.active).map((user) => {
                const stats = getUserStats(user.id);
                const capacity = capacityEdit[user.id] ?? ((user as UserType & { dailyCapacity?: number }).dailyCapacity ?? 8);
                const used = Math.min(stats.estimatedHours, capacity);
                const pct = Math.min(Math.round((used / capacity) * 100), 100);
                const status = pct >= 90 ? "sobrecarregado" : pct >= 65 ? "ocupado" : "disponível";
                const barColor = pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-yellow-400" : "bg-green-400";
                const badgeColor = pct >= 90 ? "bg-red-100 text-red-700" : pct >= 65 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700";
                return (
                  <div key={user.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black", ROLE_ICON_BG[user.role], user.role === "admin" ? "text-black" : "text-white")}>
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0", badgeColor)}>{status}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{stats.openTasks} tarefas · {stats.estimatedHours.toFixed(1)}h estimadas · {pct}% da capacidade</p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setCapacityEdit((p) => ({ ...p, [user.id]: Math.max(1, capacity - 1) }))}
                              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                              <ChevronDown size={14} />
                            </button>
                            <span className="text-xs font-bold text-gray-900 w-12 text-center">{capacity}h/dia</span>
                            <button onClick={() => setCapacityEdit((p) => ({ ...p, [user.id]: Math.min(24, capacity + 1) }))}
                              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                              <ChevronUp size={14} />
                            </button>
                            {capacityEdit[user.id] !== undefined && (
                              <button onClick={async () => {
                                await updateUserCapacity(user.id, capacity);
                                setCapacityEdit((p) => { const n = { ...p }; delete n[user.id]; return n; });
                              }} className="ml-1 px-2 py-0.5 bg-black text-yellow-400 rounded text-[10px] font-bold hover:bg-gray-800 transition-colors">
                                Salvar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendação de delegação */}
          <div className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
            <div className="px-5 py-3 border-b-2 border-gray-100 flex items-center gap-2">
              <ArrowRight size={15} className="text-yellow-500" />
              <span className="text-sm font-black">Para delegar agora: membros com mais espaço</span>
            </div>
            <div className="p-4 grid sm:grid-cols-2 gap-3">
              {users.filter((u) => u.active).map((user) => {
                const stats = getUserStats(user.id);
                const capacity = (user as UserType & { dailyCapacity?: number }).dailyCapacity ?? 8;
                const used = Math.min(stats.estimatedHours, capacity);
                return { user, free: capacity - used, pct: Math.round((used / capacity) * 100) };
              }).sort((a, b) => b.free - a.free).slice(0, 4).map(({ user, free, pct }) => (
                <div key={user.id} className={cn("flex items-center gap-3 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]",
                  pct < 50 ? "bg-green-50" : pct < 80 ? "bg-yellow-50" : "bg-red-50"
                )}>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black", ROLE_ICON_BG[user.role], user.role === "admin" ? "text-black" : "text-white")}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-gray-900">{Math.max(0, Math.round(free))}h</p>
                    <p className="text-[10px] text-gray-400">livres</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Confirmation Card ───────────────────────────────── */}
      {inviteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInviteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="bg-black px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-yellow-400" />
                <h3 className="font-bold text-white">Membro criado com sucesso!</h3>
              </div>
              <button onClick={() => setInviteConfirm(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Envie as credenciais abaixo para <span className="font-bold text-gray-900">{inviteConfirm.name}</span> acessar o sistema:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">E-mail</p>
                    <p className="text-sm font-semibold text-gray-900">{inviteConfirm.email}</p>
                  </div>
                  <button onClick={() => copyText(inviteConfirm.email, "email")}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                    {copied === "email" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide mb-0.5">Senha temporária</p>
                    <p className="text-sm font-bold text-gray-900 font-mono tracking-wider">{inviteConfirm.password}</p>
                  </div>
                  <button onClick={() => copyText(inviteConfirm.password, "password")}
                    className="p-1.5 rounded-lg hover:bg-yellow-200 text-yellow-600 hover:text-yellow-800 transition-colors">
                    {copied === "password" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const texto = `Olá ${inviteConfirm.name}! Aqui estão suas credenciais de acesso ao TDL Hub:\n\nE-mail: ${inviteConfirm.email}\nSenha: ${inviteConfirm.password}\n\nFaça login em: ${window.location.origin}/login`;
                  copyText(texto, "all");
                }}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm font-semibold text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-colors"
              >
                {copied === "all" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                Copiar mensagem completa
              </button>

              <button onClick={() => setInviteConfirm(null)}
                className="w-full py-2.5 bg-black text-yellow-400 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Panel ──────────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => { setDetail(null); setShowResetPass(false); setResetPass(""); }} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{detail.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => { setModal({ ...detail }); setIsEditing(true); setDetail(null); }}
                  className="text-sm px-3 py-1.5 rounded-lg bg-black text-yellow-400 font-bold hover:bg-gray-800">Editar</button>
                <button onClick={() => { setDetail(null); setShowResetPass(false); setResetPass(""); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={15} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", ROLE_ICON_BG[detail.role])}>
                  <span className={cn("font-black text-xl", detail.role === "admin" ? "text-black" : "text-white")}>{getInitials(detail.name)}</span>
                </div>
                <div>
                  <p className="font-black text-gray-900">{detail.name}</p>
                  <p className="text-sm text-gray-500">{detail.position}</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold mt-1 inline-block", ROLE_COLORS[detail.role])}>
                    {ROLE_LABELS[detail.role]}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contato</p>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400" />{detail.email}</div>
                {detail.phone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" />{detail.phone}</div>}
              </div>

              {/* Reset de Senha */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowResetPass((v) => !v)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <KeyRound size={14} className="text-gray-400" />
                  Redefinir senha de acesso
                </button>
                {showResetPass && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resetPass}
                        onChange={(e) => setResetPass(e.target.value)}
                        placeholder="Nova senha..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={() => setResetPass(generatePassword())}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                        title="Gerar senha"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={!resetPass}
                      className="w-full py-2 bg-black text-yellow-400 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-40 transition-colors"
                    >
                      Salvar nova senha
                    </button>
                  </div>
                )}
              </div>

              {(() => {
                const stats = getUserStats(detail.id);
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-gray-900">{stats.openTasks}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tarefas abertas</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-gray-900">{stats.activeProjects}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Projetos ativos</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-gray-900">{stats.doneTasks}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Concluídas</p>
                    </div>
                  </div>
                );
              })()}

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tarefas Recentes</p>
                <div className="space-y-2">
                  {tasks.filter((t) => t.assigneeId === detail.id).slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0",
                        task.status === "concluida" ? "bg-green-400" : task.priority === "urgente" ? "bg-red-400" : "bg-yellow-400"
                      )} />
                      <p className="text-xs text-gray-700 flex-1 truncate">{task.title}</p>
                    </div>
                  ))}
                  {tasks.filter((t) => t.assigneeId === detail.id).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">Nenhuma tarefa atribuída</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────── */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{isEditing ? "Editar Membro" : "Convidar Novo Membro"}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nome *</label>
                <input value={modal.name ?? ""} onChange={(e) => setModal((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">E-mail *</label>
                  <input value={modal.email ?? ""} onChange={(e) => setModal((p) => ({ ...p, email: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" placeholder="email@" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Telefone</label>
                  <input value={modal.phone ?? ""} onChange={(e) => setModal((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" placeholder="(11) 9..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Cargo</label>
                  <input value={modal.position ?? ""} onChange={(e) => setModal((p) => ({ ...p, position: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400" placeholder="Ex: Designer" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Departamento</label>
                  <select value={modal.department ?? "Design"} onChange={(e) => setModal((p) => ({ ...p, department: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Papel</label>
                  <select value={modal.role ?? "collaborator"} onChange={(e) => setModal((p) => ({ ...p, role: e.target.value as Role }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400 bg-white">
                    {(["admin", "leader", "collaborator"] as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="active" checked={modal.active ?? true} onChange={(e) => setModal((p) => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-400" />
                  <label htmlFor="active" className="text-sm text-gray-700 font-medium">Membro ativo</label>
                </div>
              </div>

              {/* Senha temporária (apenas na criação) */}
              {!isEditing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2">Senha de acesso</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modal.tempPassword ?? ""}
                      onChange={(e) => setModal((p) => ({ ...p, tempPassword: e.target.value }))}
                      className="flex-1 text-sm border border-yellow-300 rounded-lg px-3 py-2 bg-white font-mono focus:outline-none focus:border-yellow-400"
                      placeholder="Senha temporária"
                    />
                    <button
                      type="button"
                      onClick={() => setModal((p) => ({ ...p, tempPassword: generatePassword() }))}
                      className="p-2 rounded-lg border border-yellow-300 hover:bg-yellow-100 text-yellow-700"
                      title="Gerar nova senha"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-yellow-600 mt-1.5">O membro usará essa senha para fazer o primeiro acesso.</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center">
              {isEditing && (
                <button onClick={() => { deleteUser(modal.id!); setModal(null); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium">Excluir</button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
                <button onClick={handleSave} disabled={!modal.name || !modal.email}
                  className="px-4 py-2 text-sm font-bold bg-black text-yellow-400 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors">
                  {isEditing ? "Salvar" : "Criar e ver credenciais"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}
