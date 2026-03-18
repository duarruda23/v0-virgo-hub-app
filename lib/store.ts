"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Client, Lead, Project, Delivery, Task, Product, Notification } from "./types";
import { MOCK_USERS, MOCK_CLIENTS, MOCK_LEADS, MOCK_PROJECTS, MOCK_DELIVERIES, MOCK_TASKS, MOCK_PRODUCTS, MOCK_NOTIFICATIONS } from "./mock-data";

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthStore {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    { name: "virgo-auth" }
  )
);

// ─── CRM Store ────────────────────────────────────────────────────────────────
interface CRMStore {
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (id: string, status: Lead["status"]) => void;
}

export const useCRMStore = create<CRMStore>()(
  persist(
    (set) => ({
      leads: MOCK_LEADS,
      addLead: (lead) => set((s) => ({ leads: [...s.leads, lead] })),
      updateLead: (id, data) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l)) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      moveLeadStatus: (id, status) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l)) })),
    }),
    { name: "virgo-crm" }
  )
);

// ─── Clients Store ─────────────────────────────────────────────────────────────
interface ClientsStore {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set) => ({
      clients: MOCK_CLIENTS,
      addClient: (client) => set((s) => ({ clients: [...s.clients, client] })),
      updateClient: (id, data) => set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)) })),
      deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
    }),
    { name: "virgo-clients" }
  )
);

// ─── Projects Store ───────────────────────────────────────────────────────────
interface ProjectsStore {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: MOCK_PROJECTS,
      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, data) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)) })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: "virgo-projects" }
  )
);

// ─── Deliveries Store ─────────────────────────────────────────────────────────
interface DeliveriesStore {
  deliveries: Delivery[];
  addDelivery: (delivery: Delivery) => void;
  updateDelivery: (id: string, data: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
}

export const useDeliveriesStore = create<DeliveriesStore>()(
  persist(
    (set) => ({
      deliveries: MOCK_DELIVERIES,
      addDelivery: (d) => set((s) => ({ deliveries: [...s.deliveries, d] })),
      updateDelivery: (id, data) => set((s) => ({ deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d)) })),
      deleteDelivery: (id) => set((s) => ({ deliveries: s.deliveries.filter((d) => d.id !== id) })),
    }),
    { name: "virgo-deliveries" }
  )
);

// ─── Tasks Store ──────────────────────────────────────────────────────────────
interface TasksStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: Task["status"]) => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS,
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, data) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      moveTaskStatus: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)) })),
    }),
    { name: "virgo-tasks" }
  )
);

// ─── Products Store ───────────────────────────────────────────────────────────
interface ProductsStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS,
      addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, data) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
    }),
    { name: "virgo-products" }
  )
);

// ─── Users Store ──────────────────────────────────────────────────────────────
interface UsersStore {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set) => ({
      users: MOCK_USERS,
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    { name: "virgo-users" }
  )
);

// ─── Pipeline Store ───────────────────────────────────────────────────────────
export interface PipelineStage {
  id: string;
  label: string;
  color: string; // tailwind border-top color class
  order: number;
}

const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "novo", label: "Novo", color: "#3b82f6", order: 0 },
  { id: "em_contato", label: "Em Contato", color: "#eab308", order: 1 },
  { id: "proposta", label: "Proposta", color: "#a855f7", order: 2 },
  { id: "negociacao", label: "Negociação", color: "#f97316", order: 3 },
  { id: "ganho", label: "Ganho", color: "#22c55e", order: 4 },
  { id: "perdido", label: "Perdido", color: "#ef4444", order: 5 },
];

interface PipelineStore {
  stages: PipelineStage[];
  addStage: (stage: PipelineStage) => void;
  updateStage: (id: string, data: Partial<PipelineStage>) => void;
  deleteStage: (id: string) => void;
  reorderStages: (stages: PipelineStage[]) => void;
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set) => ({
      stages: DEFAULT_PIPELINE_STAGES,
      addStage: (stage) => set((s) => ({ stages: [...s.stages, stage] })),
      updateStage: (id, data) => set((s) => ({ stages: s.stages.map((st) => st.id === id ? { ...st, ...data } : st) })),
      deleteStage: (id) => set((s) => ({ stages: s.stages.filter((st) => st.id !== id) })),
      reorderStages: (stages) => set({ stages }),
    }),
    { name: "virgo-pipeline" }
  )
);

// ─── Automation Store ─────────────────────────────────────────────────────────
export type AutomationTriggerType = "webhook" | "task";

export interface WebhookAutomation {
  type: "webhook";
  url: string;
  active: boolean;
}

export interface TaskAutomation {
  type: "task";
  titleTemplate: string;   // suporta {{lead_name}}, {{company}}, {{stage}}
  priority: "baixa" | "media" | "alta" | "urgente";
  assigneeId: string;      // "" = responsável do lead
  dueDays: number;          // dias após entrada na etapa
  active: boolean;
}

export type StageAutomation = WebhookAutomation | TaskAutomation;

export interface StageAutomationConfig {
  stageId: string;
  automations: StageAutomation[];
}

interface AutomationStore {
  configs: StageAutomationConfig[];
  setAutomations: (stageId: string, automations: StageAutomation[]) => void;
  getAutomations: (stageId: string) => StageAutomation[];
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => ({
      configs: [],
      setAutomations: (stageId, automations) =>
        set((s) => {
          const exists = s.configs.find((c) => c.stageId === stageId);
          if (exists) {
            return { configs: s.configs.map((c) => c.stageId === stageId ? { ...c, automations } : c) };
          }
          return { configs: [...s.configs, { stageId, automations }] };
        }),
      getAutomations: (stageId) => get().configs.find((c) => c.stageId === stageId)?.automations ?? [],
    }),
    { name: "virgo-automations" }
  )
);

// ─── Notifications Store ──────────────────────────────────────────────────────
interface NotificationsStore {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));
