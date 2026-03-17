// ─── Auth ────────────────────────────────────────────────────────────────────
export type Role = "admin" | "leader" | "collaborator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

// ─── Clients ─────────────────────────────────────────────────────────────────
export type ClientStatus = "ativo" | "inativo" | "prospecto" | "churned";
export type ClientTier = "basic" | "standard" | "premium" | "enterprise";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  cnpj?: string;
  website?: string;
  status: ClientStatus;
  tier: ClientTier;
  segment?: string;
  responsibleId: string;
  address?: string;
  city?: string;
  notes?: string;
  tags: string[];
  mrr: number;
  createdAt: string;
  updatedAt: string;
}

// ─── CRM / Pipeline ──────────────────────────────────────────────────────────
export type LeadStatus = "novo" | "em_contato" | "proposta" | "negociacao" | "ganho" | "perdido";
export type LeadSource = "indicacao" | "site" | "redes_sociais" | "email" | "evento" | "outros";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  value: number;
  responsibleId: string;
  notes?: string;
  tags: string[];
  nextFollowUp?: string;
  lostReason?: string;
  convertedClientId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export type ProjectStatus = "briefing" | "planejamento" | "em_execucao" | "revisao" | "aprovacao" | "concluido" | "pausado" | "cancelado";
export type ProjectPriority = "baixa" | "media" | "alta" | "urgente";

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  managerId: string;
  teamIds: string[];
  budget?: number;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  tags: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Deliveries ──────────────────────────────────────────────────────────────
export type DeliveryStatus = "pendente" | "em_producao" | "em_revisao" | "aprovado" | "entregue" | "cancelado";
export type DeliveryType = "post_feed" | "post_stories" | "reels" | "video" | "banner" | "copy" | "relatorio" | "landing_page" | "outro";

export interface Delivery {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  type: DeliveryType;
  status: DeliveryStatus;
  responsibleId: string;
  dueDate: string;
  deliveredAt?: string;
  fileUrl?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskStatus = "backlog" | "a_fazer" | "em_progresso" | "em_revisao" | "concluida";
export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  deliveryId?: string;
  assigneeId: string;
  creatorId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Products / Services ─────────────────────────────────────────────────────
export type BillingCycle = "mensal" | "trimestral" | "semestral" | "anual" | "unico";
export type ProductCategory = "gestao_social" | "trafego_pago" | "seo" | "design" | "video" | "consultoria" | "outro";

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  billingCycle: BillingCycle;
  active: boolean;
  deliverables: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string;
  createdAt: string;
}
