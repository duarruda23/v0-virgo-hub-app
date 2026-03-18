"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

// ─── Auth Store (único que persiste — sessão do usuário) ──────────────────────
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

// ─── Pipeline Store (persiste localmente como config de UI) ───────────────────
export interface PipelineStage {
  id: string;
  label: string;
  color: string;
  order: number;
}

const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "novo",       label: "Novo",       color: "#3b82f6", order: 0 },
  { id: "em_contato", label: "Em Contato", color: "#eab308", order: 1 },
  { id: "proposta",   label: "Proposta",   color: "#a855f7", order: 2 },
  { id: "negociacao", label: "Negociação", color: "#f97316", order: 3 },
  { id: "ganho",      label: "Ganho",      color: "#22c55e", order: 4 },
  { id: "perdido",    label: "Perdido",    color: "#ef4444", order: 5 },
];

interface PipelineStore {
  stages: PipelineStage[];
  setStages: (stages: PipelineStage[]) => void;
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set) => ({
      stages: DEFAULT_PIPELINE_STAGES,
      setStages: (stages) => {
        const seen = new Set<string>();
        const deduped = stages.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        set({ stages: deduped });
      },
    }),
    {
      name: "virgo-pipeline-v6",
      merge: (_persisted, current) => {
        const p = _persisted as Partial<PipelineStore>;
        if (!p.stages?.length) return current;
        const seen = new Set<string>();
        const deduped = p.stages.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        return { ...current, stages: deduped };
      },
    }
  )
);

// ─── Automation Store ─────────────────────────────────────────────────────────
export type TimeUnit = "segundos" | "minutos" | "horas" | "dias" | "meses";

export interface WebhookAutomation {
  type: "webhook";
  url: string;
  active: boolean;
}

export interface TaskAutomation {
  type: "task";
  titleTemplate: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  assigneeId: string;
  dueValue: number;
  dueUnit: TimeUnit;
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
          if (exists) return { configs: s.configs.map((c) => c.stageId === stageId ? { ...c, automations } : c) };
          return { configs: [...s.configs, { stageId, automations }] };
        }),
      getAutomations: (stageId) => get().configs.find((c) => c.stageId === stageId)?.automations ?? [],
    }),
    { name: "virgo-automations-v2" }
  )
);
