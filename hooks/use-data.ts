import useSWR, { mutate } from "swr";
import type { User, Client, Lead, Project, Delivery, Task, Product, Notification } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Users ────────────────────────────────────────────────────────────────────
export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>("/api/users", fetcher);
  return { users: data ?? [], error, isLoading };
}

export async function createUser(data: Partial<User>) {
  const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/users");
  return json;
}

export async function updateUser(id: string, data: Partial<User>) {
  const res = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/users");
  return json;
}

export async function deleteUser(id: string) {
  await fetch(`/api/users/${id}`, { method: "DELETE" });
  mutate("/api/users");
}

// ─── Clients ─────────────────────────────────────────────────────────────────
export function useClients() {
  const { data, error, isLoading } = useSWR<Client[]>("/api/clients", fetcher);
  return { clients: data ?? [], error, isLoading };
}

export async function createClient(data: Partial<Client>) {
  const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/clients");
  return json;
}

export async function updateClient(id: string, data: Partial<Client>) {
  const res = await fetch(`/api/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/clients");
  return json;
}

export async function deleteClient(id: string) {
  await fetch(`/api/clients/${id}`, { method: "DELETE" });
  mutate("/api/clients");
}

// ─── Leads ────────────────────────────────────────────────────────────────────
export function useLeads() {
  const { data, error, isLoading } = useSWR<Lead[]>("/api/leads", fetcher);
  return { leads: data ?? [], error, isLoading };
}

export async function createLead(data: Partial<Lead>) {
  const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/leads");
  return json;
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/leads");
  return json;
}

export async function deleteLead(id: string) {
  await fetch(`/api/leads/${id}`, { method: "DELETE" });
  mutate("/api/leads");
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjects() {
  const { data, error, isLoading } = useSWR<Project[]>("/api/projects", fetcher);
  return { projects: data ?? [], error, isLoading };
}

export async function createProject(data: Partial<Project>) {
  const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/projects");
  return json;
}

export async function updateProject(id: string, data: Partial<Project>) {
  const res = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/projects");
  return json;
}

export async function deleteProject(id: string) {
  await fetch(`/api/projects/${id}`, { method: "DELETE" });
  mutate("/api/projects");
}

// ─── Deliveries ───────────────────────────────────────────────────────────────
export function useDeliveries() {
  const { data, error, isLoading } = useSWR<Delivery[]>("/api/deliveries", fetcher);
  return { deliveries: data ?? [], error, isLoading };
}

export async function createDelivery(data: Partial<Delivery>) {
  const res = await fetch("/api/deliveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/deliveries");
  return json;
}

export async function updateDelivery(id: string, data: Partial<Delivery>) {
  const res = await fetch(`/api/deliveries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/deliveries");
  return json;
}

export async function deleteDelivery(id: string) {
  await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
  mutate("/api/deliveries");
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function useTasks() {
  const { data, error, isLoading } = useSWR<Task[]>("/api/tasks", fetcher);
  return { tasks: data ?? [], error, isLoading };
}

export async function createTask(data: Partial<Task>) {
  const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/tasks");
  return json;
}

export async function updateTask(id: string, data: Partial<Task>) {
  const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/tasks");
  return json;
}

export async function deleteTask(id: string) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  mutate("/api/tasks");
}

// ─── Products ─────────────────────────────────────────────────────────────────
export function useProducts() {
  const { data, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);
  return { products: data ?? [], error, isLoading };
}

export async function createProduct(data: Partial<Product>) {
  const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/products");
  return json;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const res = await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json();
  mutate("/api/products");
  return json;
}

export async function deleteProduct(id: string) {
  await fetch(`/api/products/${id}`, { method: "DELETE" });
  mutate("/api/products");
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function useNotifications() {
  const { data, error, isLoading } = useSWR<Notification[]>("/api/notifications", fetcher);
  return { notifications: data ?? [], error, isLoading };
}

export async function markNotificationRead(id: string) {
  await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  mutate("/api/notifications");
}

export async function markAllNotificationsRead(notifications: Notification[]) {
  await Promise.all(notifications.filter((n) => !n.read).map((n) => markNotificationRead(n.id)));
  mutate("/api/notifications");
}

// ─── Automations ──────────────────────────────────────────────────────────────
export interface AutomationRecord {
  id: string;
  stageId: string;
  type: "webhook" | "task";
  active: boolean;
  // webhook
  url?: string;
  // task
  titleTemplate?: string;
  priority?: string;
  assigneeId?: string;
  dueValue?: number;
  dueUnit?: string;
}

export function useAutomations(stageId?: string) {
  const key = stageId ? `/api/automations?stageId=${stageId}` : "/api/automations";
  const { data, error, isLoading } = useSWR<AutomationRecord[]>(key, fetcher);
  return { automations: data ?? [], error, isLoading };
}

export async function createAutomation(data: Omit<AutomationRecord, "id">) {
  const res = await fetch("/api/automations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  mutate(`/api/automations?stageId=${data.stageId}`);
  mutate("/api/automations");
  return json as AutomationRecord;
}

export async function updateAutomation(id: string, stageId: string, data: Partial<AutomationRecord>) {
  const res = await fetch(`/api/automations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  mutate(`/api/automations?stageId=${stageId}`);
  mutate("/api/automations");
  return json;
}

export async function deleteAutomation(id: string, stageId: string) {
  await fetch(`/api/automations/${id}`, { method: "DELETE" });
  mutate(`/api/automations?stageId=${stageId}`);
  mutate("/api/automations");
}

// ─── Project Checklist ────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  projectId: string;
  text: string;
  done: boolean;
  position: number;
  createdAt?: string;
}

export function useProjectChecklist(projectId: string | null | undefined) {
  const key = projectId ? `/api/checklist?projectId=${projectId}` : null;
  const { data, error, isLoading } = useSWR<ChecklistItem[]>(key, fetcher);
  return { items: data ?? [], error, isLoading };
}

export async function addChecklistItem(projectId: string, text: string) {
  const res = await fetch("/api/checklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, text }),
  });
  const json = await res.json();
  mutate(`/api/checklist?projectId=${projectId}`);
  return json as ChecklistItem;
}

export async function toggleChecklistItem(id: string, projectId: string, done: boolean) {
  await fetch(`/api/checklist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  mutate(`/api/checklist?projectId=${projectId}`);
}

export async function updateChecklistItem(id: string, projectId: string, text: string) {
  await fetch(`/api/checklist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  mutate(`/api/checklist?projectId=${projectId}`);
}

export async function deleteChecklistItem(id: string, projectId: string) {
  await fetch(`/api/checklist/${id}`, { method: "DELETE" });
  mutate(`/api/checklist?projectId=${projectId}`);
}

// ─── Project Templates ────────────────────────────────────────────────────────
export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  assigneeId?: string | null;
  priority: string;
  dueDays: number;
  position: number;
  deliverable?: string | null;
  createdAt?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  tasks: TemplateTask[];
  createdAt?: string;
  updatedAt?: string;
}

export function useProjectTemplates() {
  const { data, error, isLoading } = useSWR<ProjectTemplate[]>("/api/templates", fetcher);
  return { templates: data ?? [], error, isLoading };
}

export async function createProjectTemplate(data: Partial<ProjectTemplate>) {
  const res = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  mutate("/api/templates");
  return json as ProjectTemplate;
}

export async function updateProjectTemplate(id: string, data: Partial<ProjectTemplate>) {
  await fetch(`/api/templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mutate("/api/templates");
}

export async function deleteProjectTemplate(id: string) {
  await fetch(`/api/templates/${id}`, { method: "DELETE" });
  mutate("/api/templates");
}

export async function addTemplateTask(templateId: string, data: Partial<TemplateTask>) {
  const res = await fetch(`/api/templates/${templateId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  mutate("/api/templates");
  return json as TemplateTask;
}

export async function updateTemplateTask(taskId: string, data: Partial<TemplateTask>) {
  await fetch(`/api/template-tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mutate("/api/templates");
}

export async function deleteTemplateTask(taskId: string) {
  await fetch(`/api/template-tasks/${taskId}`, { method: "DELETE" });
  mutate("/api/templates");
}

// ─── Financial Entries ────────────────────────────────────────────────────────
export interface FinancialEntry {
  id: string;
  clientId?: string | null;
  projectId?: string | null;
  type: "receita" | "despesa";
  category: "mrr" | "avulso" | "bonus" | "comissao" | "ajuste" | "desconto" | "reembolso" | "parcela";
  description: string;
  amount: number;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  dueDate?: string | null;
  paidAt?: string | null;
  recurrent: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function useFinancialEntries(params?: { clientId?: string; month?: string }) {
  const query = params?.clientId
    ? `/api/financial?clientId=${params.clientId}`
    : params?.month
    ? `/api/financial?month=${params.month}`
    : "/api/financial";
  const { data, error, isLoading } = useSWR<FinancialEntry[]>(query, fetcher);
  return { entries: data ?? [], error, isLoading };
}

export async function createFinancialEntry(data: Partial<FinancialEntry>) {
  const res = await fetch("/api/financial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  mutate("/api/financial");
  return json as FinancialEntry;
}

export async function updateFinancialEntry(id: string, data: Partial<FinancialEntry>) {
  await fetch(`/api/financial/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  mutate("/api/financial");
}

export async function deleteFinancialEntry(id: string) {
  await fetch(`/api/financial/${id}`, { method: "DELETE" });
  mutate("/api/financial");
}
