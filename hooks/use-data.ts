import useSWR, { mutate } from "swr";
import type { User, Client, Lead, Project, Delivery, Task, Product } from "@/lib/types";

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
