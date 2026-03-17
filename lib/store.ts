"use client";
import { create } from "zustand";
import type { User, Client, Lead, Project, Delivery, Task, Product, Notification } from "./types";
import { MOCK_USERS, MOCK_CLIENTS, MOCK_LEADS, MOCK_PROJECTS, MOCK_DELIVERIES, MOCK_TASKS, MOCK_PRODUCTS, MOCK_NOTIFICATIONS } from "./mock-data";

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthStore {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: MOCK_USERS[0], // default: admin
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));

// ─── CRM Store ────────────────────────────────────────────────────────────────
interface CRMStore {
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (id: string, status: Lead["status"]) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  leads: MOCK_LEADS,
  addLead: (lead) => set((s) => ({ leads: [...s.leads, lead] })),
  updateLead: (id, data) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l)) })),
  deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
  moveLeadStatus: (id, status) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l)) })),
}));

// ─── Clients Store ─────────────────────────────────────────────────────────────
interface ClientsStore {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useClientsStore = create<ClientsStore>((set) => ({
  clients: MOCK_CLIENTS,
  addClient: (client) => set((s) => ({ clients: [...s.clients, client] })),
  updateClient: (id, data) => set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)) })),
  deleteClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
}));

// ─── Projects Store ───────────────────────────────────────────────────────────
interface ProjectsStore {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: MOCK_PROJECTS,
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, data) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)) })),
  deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
}));

// ─── Deliveries Store ─────────────────────────────────────────────────────────
interface DeliveriesStore {
  deliveries: Delivery[];
  addDelivery: (delivery: Delivery) => void;
  updateDelivery: (id: string, data: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
}

export const useDeliveriesStore = create<DeliveriesStore>((set) => ({
  deliveries: MOCK_DELIVERIES,
  addDelivery: (d) => set((s) => ({ deliveries: [...s.deliveries, d] })),
  updateDelivery: (id, data) => set((s) => ({ deliveries: s.deliveries.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d)) })),
  deleteDelivery: (id) => set((s) => ({ deliveries: s.deliveries.filter((d) => d.id !== id) })),
}));

// ─── Tasks Store ──────────────────────────────────────────────────────────────
interface TasksStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: Task["status"]) => void;
}

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: MOCK_TASKS,
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, data) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  moveTaskStatus: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)) })),
}));

// ─── Products Store ───────────────────────────────────────────────────────────
interface ProductsStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: MOCK_PRODUCTS,
  addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
  updateProduct: (id, data) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)) })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
}));

// ─── Users Store ──────────────────────────────────────────────────────────────
interface UsersStore {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: MOCK_USERS,
  addUser: (u) => set((s) => ({ users: [...s.users, u] })),
  updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
  deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
}));

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
