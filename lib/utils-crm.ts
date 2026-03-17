import type { LeadStatus, ProjectStatus, DeliveryStatus, TaskStatus, TaskPriority, ProjectPriority, ClientTier, ClientStatus, ProductCategory, BillingCycle } from "./types";

// ─── Status Labels ─────────────────────────────────────────────────────────────
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  proposta: "Proposta",
  negociacao: "Negociação",
  ganho: "Ganho",
  perdido: "Perdido",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-blue-100 text-blue-800 border-blue-200",
  em_contato: "bg-yellow-100 text-yellow-800 border-yellow-200",
  proposta: "bg-purple-100 text-purple-800 border-purple-200",
  negociacao: "bg-orange-100 text-orange-800 border-orange-200",
  ganho: "bg-green-100 text-green-800 border-green-200",
  perdido: "bg-red-100 text-red-800 border-red-200",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  briefing: "Briefing",
  planejamento: "Planejamento",
  em_execucao: "Em Execução",
  revisao: "Revisão",
  aprovacao: "Aprovação",
  concluido: "Concluído",
  pausado: "Pausado",
  cancelado: "Cancelado",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  briefing: "bg-gray-100 text-gray-700 border-gray-200",
  planejamento: "bg-blue-100 text-blue-800 border-blue-200",
  em_execucao: "bg-yellow-100 text-yellow-800 border-yellow-200",
  revisao: "bg-orange-100 text-orange-800 border-orange-200",
  aprovacao: "bg-purple-100 text-purple-800 border-purple-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  pausado: "bg-gray-100 text-gray-500 border-gray-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pendente: "Pendente",
  em_producao: "Em Produção",
  em_revisao: "Em Revisão",
  aprovado: "Aprovado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pendente: "bg-gray-100 text-gray-700 border-gray-200",
  em_producao: "bg-blue-100 text-blue-800 border-blue-200",
  em_revisao: "bg-yellow-100 text-yellow-800 border-yellow-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  entregue: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  a_fazer: "A Fazer",
  em_progresso: "Em Progresso",
  em_revisao: "Em Revisão",
  concluida: "Concluída",
};

export const PRIORITY_LABELS: Record<TaskPriority | ProjectPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_COLORS: Record<TaskPriority | ProjectPriority, string> = {
  baixa: "bg-gray-100 text-gray-600 border-gray-200",
  media: "bg-blue-100 text-blue-700 border-blue-200",
  alta: "bg-orange-100 text-orange-700 border-orange-200",
  urgente: "bg-red-100 text-red-700 border-red-200",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  prospecto: "Prospecto",
  churned: "Churned",
};

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  inativo: "bg-gray-100 text-gray-600 border-gray-200",
  prospecto: "bg-blue-100 text-blue-800 border-blue-200",
  churned: "bg-red-100 text-red-800 border-red-200",
};

export const CLIENT_TIER_LABELS: Record<ClientTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
  enterprise: "Enterprise",
};

export const CLIENT_TIER_COLORS: Record<ClientTier, string> = {
  basic: "bg-gray-100 text-gray-700",
  standard: "bg-blue-100 text-blue-800",
  premium: "bg-yellow-100 text-yellow-800",
  enterprise: "bg-purple-100 text-purple-800",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  gestao_social: "Gestão Social",
  trafego_pago: "Tráfego Pago",
  seo: "SEO",
  design: "Design",
  video: "Vídeo",
  consultoria: "Consultoria",
  outro: "Outro",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  unico: "Pagamento Único",
};

// ─── Formatters ────────────────────────────────────────────────────────────────
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/**
 * Formata uma data ISO (YYYY-MM-DD...) como DD/MM/YYYY.
 * Faz o parse manual da string para evitar qualquer dependência de
 * toLocaleDateString / Intl / fuso horário — garante resultado idêntico
 * no servidor (Node) e no cliente (browser), eliminando hydration mismatch.
 */
export function formatDate(date: string) {
  if (!date) return "—";
  // Extrai os segmentos diretamente da string ISO sem instanciar Date
  const [year, month, day] = date.split("T")[0].split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

export function formatRelativeDate(date: string) {
  if (!date) return "—";
  return formatDate(date);
}

export function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
