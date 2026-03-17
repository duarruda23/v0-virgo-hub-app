// v2 — sem duplicatas
import type { User, Client, Lead, Project, Delivery, Task, Product, Notification } from "./types";

// ─── Users ────────────────────────────────────────────────────────────────────
// Começa vazio — primeiro cadastro via /login cria o admin
export const MOCK_USERS: User[] = [];

// ─── Clients ──────────────────────────────────────────────────────────────────
export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "Rafael Oliveira", email: "rafael@techsolve.com.br", phone: "(11) 98765-4321", company: "TechSolve", cnpj: "12.345.678/0001-90", website: "techsolve.com.br", status: "ativo", tier: "premium", segment: "Tecnologia", responsibleId: "u1", city: "São Paulo", notes: "Cliente estratégico.", tags: ["tech", "b2b"], mrr: 8500, createdAt: "2024-01-20", updatedAt: "2025-01-05" },
  { id: "c2", name: "Mariana Costa", email: "mariana@beautystore.com.br", phone: "(21) 97654-3210", company: "Beauty Store", cnpj: "23.456.789/0001-01", website: "beautystore.com.br", status: "ativo", tier: "standard", segment: "E-commerce", responsibleId: "u1", city: "Rio de Janeiro", notes: "Focada em Meta Ads.", tags: ["ecommerce", "beauty"], mrr: 4200, createdAt: "2024-02-14", updatedAt: "2025-02-01" },
  { id: "c3", name: "Carlos Neto", email: "carlos@construmax.com.br", phone: "(31) 96543-2109", company: "ConstruMax", cnpj: "34.567.890/0001-12", website: "construmax.com.br", status: "ativo", tier: "enterprise", segment: "Construção Civil", responsibleId: "u1", city: "Belo Horizonte", notes: "Maior cliente da carteira.", tags: ["construcao", "b2b"], mrr: 15000, createdAt: "2023-11-01", updatedAt: "2025-03-01" },
  { id: "c4", name: "Fernanda Reis", email: "fernanda@clinicavida.com.br", phone: "(41) 95432-1098", company: "Clínica Vida", cnpj: "45.678.901/0001-23", status: "ativo", tier: "standard", segment: "Saúde", responsibleId: "u1", city: "Curitiba", notes: "Foco em Google Ads e SEO local.", tags: ["saude", "local"], mrr: 3800, createdAt: "2024-04-10", updatedAt: "2025-01-20" },
  { id: "c5", name: "Pedro Alves", email: "pedro@fitnesswow.com.br", phone: "(51) 94321-0987", company: "FitnessWow", cnpj: "56.789.012/0001-34", status: "inativo", tier: "basic", segment: "Fitness", responsibleId: "u1", city: "Porto Alegre", notes: "Contrato pausado.", tags: ["fitness"], mrr: 0, createdAt: "2024-05-01", updatedAt: "2024-12-01" },
  { id: "c6", name: "Júlia Monteiro", email: "julia@modajulia.com.br", phone: "(11) 93210-9876", company: "Moda Julia", cnpj: "67.890.123/0001-45", status: "prospecto", tier: "basic", segment: "Moda", responsibleId: "u1", city: "São Paulo", notes: "Aguardando proposta.", tags: ["moda", "instagram"], mrr: 0, createdAt: "2025-01-15", updatedAt: "2025-03-10" },
];

// ─── Leads ────────────────────────────────────────────────────────────────────
export const MOCK_LEADS: Lead[] = [
  { id: "l1", name: "Ricardo Yamamoto", email: "ricardo@yamamoto.com.br", phone: "(11) 92109-8765", company: "Yamamoto Foods", status: "negociacao", source: "indicacao", value: 6000, responsibleId: "u1", notes: "Indicado pelo Rafael da TechSolve.", tags: ["food", "b2c"], nextFollowUp: "2025-04-02", createdAt: "2025-02-10", updatedAt: "2025-03-15" },
  { id: "l2", name: "Sabrina Lopes", email: "sabrina@studiolk.com.br", phone: "(21) 91098-7654", company: "Studio LK", status: "proposta", source: "site", value: 4500, responsibleId: "u1", notes: "Chegou pelo formulário do site.", tags: ["studio", "local"], nextFollowUp: "2025-03-28", createdAt: "2025-02-20", updatedAt: "2025-03-10" },
  { id: "l3", name: "Thiago Barros", email: "thiago@barrosadv.com.br", phone: "(31) 90987-6543", company: "Barros & Advogados", status: "em_contato", source: "linkedin", value: 5000, responsibleId: "u1", notes: "Escritório de advocacia.", tags: ["juridico", "b2b"], nextFollowUp: "2025-04-05", createdAt: "2025-03-01", updatedAt: "2025-03-12" },
  { id: "l4", name: "Vanessa Kim", email: "vanessa@kimstore.com.br", phone: "(11) 99876-5432", company: "Kim Store", status: "novo", source: "redes_sociais", value: 3200, responsibleId: "u1", notes: "Entrou em contato pelo Instagram.", tags: ["ecommerce"], createdAt: "2025-03-14", updatedAt: "2025-03-14" },
  { id: "l5", name: "William Santos", email: "william@construtora3w.com.br", phone: "(41) 98765-4321", company: "Construtora 3W", status: "perdido", source: "evento", value: 9000, responsibleId: "u1", lostReason: "Escolheu concorrente.", tags: ["construcao"], createdAt: "2025-01-05", updatedAt: "2025-02-15" },
  { id: "l6", name: "Lucas Ferreira", email: "lucas@lf.com.br", phone: "(11) 96543-2109", company: "LF Engenharia", status: "proposta", source: "email", value: 5500, responsibleId: "u1", nextFollowUp: "2025-04-01", tags: ["engenharia", "b2b"], createdAt: "2025-03-05", updatedAt: "2025-03-16" },
];

// ─── Projects ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Gestão Social — TechSolve Q2 2025", description: "Gestão completa das redes sociais.", clientId: "c1", status: "em_execucao", priority: "alta", managerId: "u1", teamIds: ["u1"], budget: 25500, startDate: "2025-04-01", dueDate: "2025-06-30", tags: ["social", "conteudo"], progress: 35, createdAt: "2025-03-20", updatedAt: "2025-03-25" },
  { id: "p2", name: "Campanha Meta Ads — Beauty Store Maio", description: "Campanha focada no Dia das Mães.", clientId: "c2", status: "planejamento", priority: "urgente", managerId: "u1", teamIds: ["u1"], budget: 12000, startDate: "2025-04-15", dueDate: "2025-05-15", tags: ["trafego", "meta"], progress: 10, createdAt: "2025-03-22", updatedAt: "2025-03-25" },
  { id: "p3", name: "Rebranding Digital — ConstruMax", description: "Reformulação completa da presença digital.", clientId: "c3", status: "revisao", priority: "alta", managerId: "u1", teamIds: ["u1"], budget: 45000, startDate: "2025-02-01", dueDate: "2025-04-30", tags: ["branding", "design"], progress: 75, createdAt: "2025-01-25", updatedAt: "2025-03-24" },
  { id: "p4", name: "SEO e Google Ads — Clínica Vida", description: "Estratégia integrada de SEO e Google Ads.", clientId: "c4", status: "em_execucao", priority: "media", managerId: "u1", teamIds: ["u1"], budget: 11400, startDate: "2025-03-01", dueDate: "2025-05-31", tags: ["seo", "google"], progress: 40, createdAt: "2025-02-20", updatedAt: "2025-03-20" },
  { id: "p5", name: "Identidade Visual — FitnessWow", description: "Criação da identidade visual completa.", clientId: "c5", status: "concluido", priority: "media", managerId: "u1", teamIds: ["u1"], budget: 8000, startDate: "2024-10-01", dueDate: "2024-11-30", completedAt: "2024-11-28", tags: ["design", "branding"], progress: 100, createdAt: "2024-09-25", updatedAt: "2024-11-28" },
];

// ─── Deliveries ───────────────────────────────────────────────────────────────
export const MOCK_DELIVERIES: Delivery[] = [
  { id: "d1", title: "Pack de Posts Abril — TechSolve", projectId: "p1", type: "post_feed", status: "em_producao", responsibleId: "u1", dueDate: "2025-04-05", description: "8 posts para Instagram e LinkedIn.", createdAt: "2025-03-25", updatedAt: "2025-03-26" },
  { id: "d2", title: "Stories Semana 1 — TechSolve", projectId: "p1", type: "post_stories", status: "pendente", responsibleId: "u1", dueDate: "2025-04-07", createdAt: "2025-03-25", updatedAt: "2025-03-25" },
  { id: "d3", title: "Criativos Campanha Dia das Mães", projectId: "p2", type: "banner", status: "pendente", responsibleId: "u1", dueDate: "2025-04-20", description: "10 peças para Meta Ads.", createdAt: "2025-03-22", updatedAt: "2025-03-22" },
  { id: "d4", title: "Novo Logotipo — ConstruMax", projectId: "p3", type: "outro", status: "aprovado", responsibleId: "u1", dueDate: "2025-03-15", deliveredAt: "2025-03-14", createdAt: "2025-02-01", updatedAt: "2025-03-14" },
  { id: "d5", title: "Manual de Marca — ConstruMax", projectId: "p3", type: "outro", status: "em_revisao", responsibleId: "u1", dueDate: "2025-04-10", reviewNotes: "Ajustar tipografia.", createdAt: "2025-02-15", updatedAt: "2025-03-20" },
  { id: "d6", title: "Relatório SEO Março — Clínica Vida", projectId: "p4", type: "relatorio", status: "entregue", responsibleId: "u1", dueDate: "2025-03-31", deliveredAt: "2025-03-30", createdAt: "2025-03-01", updatedAt: "2025-03-30" },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Criar calendário editorial de Abril", projectId: "p1", assigneeId: "u1", creatorId: "u1", status: "em_progresso", priority: "alta", dueDate: "2025-03-30", tags: ["conteudo"], createdAt: "2025-03-20", updatedAt: "2025-03-26" },
  { id: "t2", title: "Pesquisar concorrentes da Beauty Store", projectId: "p2", assigneeId: "u1", creatorId: "u1", status: "concluida", priority: "media", dueDate: "2025-03-25", completedAt: "2025-03-24", tags: ["pesquisa"], createdAt: "2025-03-22", updatedAt: "2025-03-24" },
  { id: "t3", title: "Revisar manual de marca ConstruMax", projectId: "p3", deliveryId: "d5", assigneeId: "u1", creatorId: "u1", status: "em_revisao", priority: "alta", dueDate: "2025-04-05", tags: ["revisao", "branding"], createdAt: "2025-03-20", updatedAt: "2025-03-25" },
  { id: "t4", title: "Configurar Google Search Console", projectId: "p4", assigneeId: "u1", creatorId: "u1", status: "concluida", priority: "alta", dueDate: "2025-03-10", completedAt: "2025-03-09", tags: ["seo"], createdAt: "2025-03-01", updatedAt: "2025-03-09" },
  { id: "t5", title: "Gravar Reels produto novo — TechSolve", projectId: "p1", assigneeId: "u1", creatorId: "u1", status: "a_fazer", priority: "media", dueDate: "2025-04-10", tags: ["video", "reels"], createdAt: "2025-03-25", updatedAt: "2025-03-25" },
  { id: "t6", title: "Enviar proposta para Sabrina Lopes", assigneeId: "u1", creatorId: "u1", status: "a_fazer", priority: "urgente", dueDate: "2025-03-28", tags: ["proposta", "crm"], createdAt: "2025-03-25", updatedAt: "2025-03-25" },
  { id: "t7", title: "Follow-up Ricardo Yamamoto", assigneeId: "u1", creatorId: "u1", status: "a_fazer", priority: "alta", dueDate: "2025-04-02", tags: ["crm"], createdAt: "2025-03-15", updatedAt: "2025-03-15" },
  { id: "t8", title: "Otimizar landing page da TechSolve", projectId: "p1", assigneeId: "u1", creatorId: "u1", status: "backlog", priority: "baixa", tags: ["seo"], createdAt: "2025-03-26", updatedAt: "2025-03-26" },
];

// ─── Products ─────────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: "pr1", name: "Gestão de Redes Sociais — Básico", description: "1 rede social com 12 posts/mês.", category: "gestao_social", price: 1500, billingCycle: "mensal", active: true, deliverables: ["12 posts/mês", "Legenda + hashtags", "Relatório mensal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr2", name: "Gestão de Redes Sociais — Standard", description: "2 redes sociais com 20 posts/mês e stories.", category: "gestao_social", price: 2800, billingCycle: "mensal", active: true, deliverables: ["20 posts/mês", "Stories 3x/semana", "Relatório mensal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr3", name: "Gestão de Redes Sociais — Premium", description: "Até 4 redes com conteúdo em vídeo.", category: "gestao_social", price: 5500, billingCycle: "mensal", active: true, deliverables: ["30 posts/mês", "Reels 4x/mês", "Stories diários", "Reunião mensal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr4", name: "Tráfego Pago — Meta Ads", description: "Criação e gestão de campanhas no Meta Ads.", category: "trafego_pago", price: 2200, billingCycle: "mensal", active: true, deliverables: ["Criação de campanhas", "Gestão de verba", "Relatório semanal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr5", name: "Tráfego Pago — Google Ads", description: "Criação e gestão de campanhas no Google Ads.", category: "trafego_pago", price: 2400, billingCycle: "mensal", active: true, deliverables: ["Search + Display", "Gestão de verba", "Relatório semanal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr6", name: "SEO Completo", description: "Estratégia e execução de SEO on e off page.", category: "seo", price: 3000, billingCycle: "mensal", active: true, deliverables: ["Auditoria técnica", "Conteúdo SEO", "Link building", "Relatório mensal"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr7", name: "Identidade Visual Completa", description: "Logo, manual de marca e materiais principais.", category: "design", price: 4800, billingCycle: "unico", active: true, deliverables: ["Logo + variações", "Manual de marca", "Paleta + tipografia"], createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "pr8", name: "Consultoria Estratégica Digital", description: "Diagnóstico e plano de ação.", category: "consultoria", price: 800, billingCycle: "unico", active: false, deliverables: ["Diagnóstico digital", "Plano de ação 90 dias"], createdAt: "2024-01-01", updatedAt: "2025-01-01" },
];

// ─── Notifications ─────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [];
