import type { CollectionDef } from "./types"

export const collections: CollectionDef[] = [
  {
    id: "profiles",
    path: "/profiles/{userId}",
    icon: "👤",
    title: "Profiles",
    description:
      "Armazena os perfis dos usuários autenticados via Firebase Auth. Criado automaticamente no primeiro login com Google. O campo is_active controla o acesso ao sistema — novos usuários ficam pendentes até aprovação do admin.",
    fields: [
      { name: "userId", type: "string (doc ID)", required: true, description: "UID do Firebase Auth — usado como ID do documento" },
      { name: "full_name", type: "string", required: true, description: "Nome completo do usuário (obtido do Google)" },
      { name: "email", type: "string", required: true, description: "Endereço de e-mail do Google" },
      { name: "avatar_url", type: "string", description: "URL da foto de perfil do Google" },
      {
        name: "role",
        type: "enum",
        required: true,
        description: "Papel do usuário no sistema — controla permissões de acesso",
        values: ["admin", "leader", "collaborator"],
      },
      { name: "team_id", type: "string (ref)", description: "Referência ao ID do time (/teams/{teamId})" },
      {
        name: "is_active",
        type: "boolean",
        required: true,
        description: "Se true, o usuário pode acessar o sistema. Novos usuários recebem false por padrão",
      },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação do perfil" },
    ],
    relations: [
      { to: "teams", type: "N:1", label: "pertence a um time" },
      { to: "leads", type: "1:N", label: "responsável por leads" },
      { to: "tasks", type: "1:N", label: "responsável por tarefas" },
    ],
    indexes: [
      "email (ASC) — busca por e-mail único",
      "team_id + is_active — listagem de membros ativos por time",
      "role — filtrar por tipo de acesso",
    ],
    securityNotes: [
      "Qualquer usuário autenticado pode ler perfis",
      "Apenas admin pode alterar role e team_id",
      "O próprio usuário pode editar seus dados pessoais (nome, avatar)",
      "is_active só pode ser alterado por admin",
    ],
  },
  {
    id: "teams",
    path: "/teams/{teamId}",
    icon: "🏢",
    title: "Teams",
    description:
      "Representa os times/equipes da agência (ex: Design, Tráfego, Social). Cada time possui um líder e uma cor identificadora. Usuários são associados a times via team_id no perfil.",
    fields: [
      { name: "teamId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "name", type: "string", required: true, description: "Nome do time (ex: Design, Tráfego Pago, Social Media)" },
      { name: "leader_id", type: "string (ref)", required: true, description: "UID do líder do time — referência a /profiles/{userId}" },
      { name: "color", type: "string (hex)", required: true, description: "Cor hexadecimal para identificação visual do time (ex: #3B82F6)" },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação do time" },
    ],
    relations: [
      { to: "profiles", type: "1:N", label: "possui membros" },
      { to: "leads", type: "1:N", label: "gerencia leads" },
      { to: "clients", type: "1:N", label: "atende clientes" },
    ],
    indexes: ["name (ASC) — ordenação alfabética", "leader_id — buscar times por líder"],
    securityNotes: [
      "Apenas admin pode criar, editar e deletar times",
      "Todos os usuários autenticados podem listar times",
    ],
  },
  {
    id: "leads",
    path: "/leads/{leadId}",
    icon: "🎯",
    title: "Leads",
    description:
      "Central do pipeline de vendas (CRM). Armazena todos os prospects/potenciais clientes com informações comerciais detalhadas, histórico de interações e posição no funil de vendas. Suporta automações ao mudar de etapa.",
    fields: [
      { name: "leadId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "name", type: "string", required: true, description: "Nome completo do contato" },
      { name: "email", type: "string", description: "E-mail pessoal do lead" },
      { name: "phone", type: "string", description: "Telefone / WhatsApp" },
      { name: "company_name", type: "string", description: "Razão social da empresa" },
      { name: "trade_name", type: "string", description: "Nome fantasia da empresa" },
      { name: "cnpj", type: "string", description: "CNPJ formatado (XX.XXX.XXX/XXXX-XX)" },
      { name: "business_email", type: "string", description: "E-mail comercial da empresa" },
      { name: "address", type: "string", description: "Endereço completo" },
      { name: "niche", type: "string", description: "Nicho de atuação do negócio" },
      { name: "product_interest", type: "string", description: "Produto ou serviço de interesse" },
      { name: "price_range", type: "string", description: "Faixa de preço / budget disponível" },
      { name: "objections", type: "string (textarea)", description: "Objeções levantadas e desafios identificados" },
      {
        name: "source",
        type: "enum",
        required: true,
        description: "Canal de origem do lead",
        values: ["instagram", "google", "indicacao", "site", "whatsapp", "outro"],
      },
      {
        name: "temperature",
        type: "enum",
        required: true,
        description: "Temperatura comercial do lead",
        values: ["hot", "warm", "cold"],
      },
      { name: "estimated_value", type: "number (R$)", description: "Valor estimado do contrato em reais" },
      { name: "pipeline_stage", type: "string (ref)", required: true, description: "ID da etapa atual no CRM — referência a /crm_stages/{stageId}" },
      { name: "assigned_to", type: "string (ref)", description: "UID do responsável — referência a /profiles/{userId}" },
      { name: "team_id", type: "string (ref)", description: "ID do time responsável" },
      { name: "loss_reason", type: "string", description: "Motivo de perda (preenchido ao mover para etapa de perda)" },
      { name: "notes", type: "string (textarea)", description: "Observações gerais sobre o lead" },
      {
        name: "history",
        type: "Array<Object>",
        description: "Histórico de atividades. Cada item: { date: Timestamp, action: string, user_id: string, user_name: string }",
      },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação do lead" },
    ],
    relations: [
      { to: "crm_stages", type: "N:1", label: "pertence a uma etapa" },
      { to: "profiles", type: "N:1", label: "atribuído a um usuário" },
      { to: "teams", type: "N:1", label: "pertence a um time" },
      { to: "clients", type: "1:1", label: "pode se tornar um cliente (won stage)" },
      { to: "tasks", type: "1:N", label: "gera tarefas automáticas" },
    ],
    indexes: [
      "pipeline_stage + created_at — carregar leads por coluna do CRM",
      "assigned_to — filtrar leads por responsável (collaborator view)",
      "team_id + pipeline_stage — visão por time",
      "temperature — filtrar por temperatura",
      "created_at DESC — ordenação cronológica",
    ],
    securityNotes: [
      "Admin e leader leem todos os leads",
      "Collaborator lê apenas leads onde assigned_to === seu UID",
      "Regra isValidLead() valida: name obrigatório, pipeline_stage obrigatório",
      "history é append-only — nunca deletar itens do array",
    ],
  },
  {
    id: "crm_stages",
    path: "/crm_stages/{stageId}",
    icon: "📋",
    title: "CRM Stages",
    description:
      "Define as etapas customizáveis do pipeline de vendas. Controlam a ordenação visual das colunas no Kanban. Suportam automações (criar tarefa / disparar webhook) ao receber um lead. A etapa com is_won_stage = true dispara a criação automática de cliente.",
    fields: [
      { name: "stageId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "title", type: "string", required: true, description: "Nome da etapa exibido na coluna do Kanban" },
      { name: "color", type: "string (hex)", required: true, description: "Cor hexadecimal da etapa para identificação visual" },
      { name: "order", type: "number", required: true, description: "Posição da coluna no pipeline (ordenação crescente)" },
      {
        name: "is_won_stage",
        type: "boolean",
        required: true,
        description: "Se true, ao mover um lead para esta etapa, cria automaticamente um cliente em /clients",
      },
      {
        name: "automations",
        type: "Array<Object>",
        description:
          "Lista de automações. Cada item: { type: 'task' | 'webhook', config: { taskTitle?: string, webhookUrl?: string } }",
      },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação da etapa" },
    ],
    relations: [{ to: "leads", type: "1:N", label: "contém leads" }],
    indexes: ["order ASC — ordenação das colunas no Kanban"],
    securityNotes: [
      "Apenas admin e leader podem criar, editar e deletar etapas",
      "Exclusão de etapa deve verificar se há leads vinculados",
      "is_won_stage garante unicidade (apenas uma etapa pode ser is_won_stage = true)",
    ],
  },
  {
    id: "clients",
    path: "/clients/{clientId}",
    icon: "🤝",
    title: "Clients",
    description:
      "Clientes com contratos ativos ou histórico com a agência. Gerados automaticamente ao converter um lead (is_won_stage) ou criados manualmente. Monitoram valor mensal, saúde do relacionamento e produtos contratados.",
    fields: [
      { name: "clientId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "name", type: "string", required: true, description: "Nome do contato principal" },
      { name: "company", type: "string", description: "Nome da empresa cliente" },
      { name: "email", type: "string", description: "E-mail do cliente" },
      { name: "monthly_value", type: "number (R$)", description: "Valor mensal do contrato em reais" },
      {
        name: "status",
        type: "enum",
        required: true,
        description: "Estado atual do cliente na agência",
        values: ["active", "paused", "churn"],
      },
      {
        name: "health",
        type: "enum",
        required: true,
        description: "Indicador de saúde do relacionamento com o cliente",
        values: ["good", "attention", "critical"],
      },
      { name: "contract_url", type: "string (URL)", description: "Link externo para o documento do contrato" },
      { name: "products_closed", type: "string[]", description: "Array com os nomes dos produtos/serviços contratados" },
      { name: "team_id", type: "string (ref)", description: "ID do time responsável pelo cliente" },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de cadastro do cliente" },
    ],
    relations: [
      { to: "teams", type: "N:1", label: "atendido por um time" },
      { to: "projects", type: "1:N", label: "possui projetos" },
      { to: "deliveries", type: "1:N", label: "recebe entregas" },
      { to: "products", type: "N:N", label: "contrata produtos (via products_closed[])" },
      { to: "leads", type: "1:1", label: "originado de um lead" },
    ],
    indexes: [
      "status — filtrar clientes ativos/pausados/churn",
      "team_id + status — clientes por time",
      "health — monitorar clientes críticos",
      "monthly_value DESC — ranking por valor",
    ],
    securityNotes: [
      "Criação automática ao converter lead evita duplicatas (verificar email antes)",
      "Admin e leader têm acesso completo",
      "Collaborator não visualiza dados financeiros de outros times",
    ],
  },
  {
    id: "projects",
    path: "/projects/{projectId}",
    icon: "📁",
    title: "Projects",
    description:
      "Projetos vinculados a clientes com acompanhamento de progresso por checkpoints operacionais. Suportam múltiplos responsáveis e tarefas internas (subcoleção). O progresso é calculado automaticamente pela proporção de checkpoints concluídos.",
    fields: [
      { name: "projectId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "name", type: "string", required: true, description: "Nome do projeto" },
      { name: "client_id", type: "string (ref)", required: true, description: "ID do cliente vinculado — referência a /clients/{clientId}" },
      { name: "team_id", type: "string (ref)", description: "ID do time responsável" },
      {
        name: "status",
        type: "enum",
        required: true,
        description: "Estado atual do projeto",
        values: ["not_started", "in_progress", "paused", "completed"],
      },
      {
        name: "priority",
        type: "enum",
        required: true,
        description: "Nível de prioridade",
        values: ["urgent", "high", "medium", "low"],
      },
      {
        name: "progress",
        type: "number (0–100)",
        required: true,
        description: "Percentual de conclusão calculado automaticamente: (checkpoints concluídos / total) × 100",
      },
      { name: "due_date", type: "string (ISO date)", description: "Data de entrega no formato YYYY-MM-DD" },
      { name: "responsible_ids", type: "string[]", description: "Array de UIDs dos responsáveis pelo projeto" },
      {
        name: "checkpoints",
        type: "Array<Object>",
        description: "Checkpoints operacionais. Cada item: { id: string, label: string, completed: boolean }",
      },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação do projeto" },
    ],
    subcollections: [
      {
        path: "/projects/{projectId}/tasks/{taskId}",
        title: "Tasks (subcoleção) — tarefas internas do projeto com campos: project_id, title, status (backlog/todo/in_progress/review/done), assigned_to, due_date",
      },
    ],
    relations: [
      { to: "clients", type: "N:1", label: "pertence a um cliente" },
      { to: "profiles", type: "N:N", label: "possui responsáveis (responsible_ids[])" },
      { to: "teams", type: "N:1", label: "pertence a um time" },
    ],
    indexes: [
      "client_id — projetos por cliente",
      "responsible_ids array-contains — projetos por responsável (collaborator filter)",
      "due_date ASC — ordenar por prazo",
      "status + priority — filtros combinados",
      "team_id + status — projetos ativos por time",
    ],
    securityNotes: [
      "Collaborator lê apenas projetos onde responsible_ids contém seu UID",
      "Admin e leader têm acesso total",
      "progress é recalculado no cliente a cada update de checkpoint",
      "checkpoints suportam formato legado (objeto booleano) — função getNormalizedCheckpoints() garante compatibilidade",
    ],
  },
  {
    id: "deliveries",
    path: "/deliveries/{deliveryId}",
    icon: "📦",
    title: "Deliveries",
    description:
      "Gerencia os entregáveis para clientes com um workflow sequencial de 6 etapas de aprovação. Suporta visualização em tabela e calendário. Rastreia responsável, prazo, tipo de entrega e anexos.",
    fields: [
      { name: "deliveryId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "title", type: "string", required: true, description: "Título descritivo da entrega" },
      { name: "client_id", type: "string (ref)", required: true, description: "ID do cliente — referência a /clients/{clientId}" },
      { name: "client_name", type: "string", required: true, description: "Nome do cliente (desnormalizado para evitar joins)" },
      { name: "team_id", type: "string (ref)", description: "ID do time responsável" },
      {
        name: "type",
        type: "enum",
        required: true,
        description: "Tipo de entrega",
        values: ["post", "relatorio", "campanha", "site", "video", "design", "outro"],
      },
      {
        name: "status",
        type: "enum",
        required: true,
        description: "Etapa atual no workflow sequencial de aprovação",
        values: ["scheduled", "in_production", "internal_review", "client_approval", "approved", "delivered"],
      },
      { name: "due_date", type: "string (ISO date)", description: "Prazo de entrega no formato YYYY-MM-DD" },
      { name: "assigned_to", type: "string (ref)", description: "UID do responsável" },
      { name: "assigned_name", type: "string", description: "Nome do responsável (desnormalizado)" },
      { name: "attachments", type: "string[]", description: "Array de URLs dos anexos da entrega" },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação da entrega" },
    ],
    relations: [
      { to: "clients", type: "N:1", label: "pertence a um cliente" },
      { to: "profiles", type: "N:1", label: "atribuída a um responsável" },
      { to: "teams", type: "N:1", label: "pertence a um time" },
    ],
    indexes: [
      "client_id + due_date — entregas por cliente ordenadas por prazo",
      "assigned_to + status — entregas do responsável por etapa",
      "due_date ASC — calendário e próximas entregas",
      "status — filtrar por etapa do workflow",
      "team_id + due_date — entregas do time por prazo",
    ],
    securityNotes: [
      "Collaborator pode avançar status apenas de entregas onde assigned_to === seu UID",
      "Admin e leader têm acesso total",
      "Status só pode avançar na ordem sequencial (nunca retroceder)",
    ],
  },
  {
    id: "tasks",
    path: "/tasks/{taskId}",
    icon: "✅",
    title: "Tasks",
    description:
      "Tarefas standalone — criadas manualmente pelos usuários ou automaticamente por automações do CRM (ao mover um lead para uma etapa configurada). Podem estar vinculadas a um lead via related_lead_id.",
    fields: [
      { name: "taskId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "title", type: "string", required: true, description: "Título da tarefa" },
      { name: "description", type: "string", description: "Descrição detalhada da tarefa" },
      {
        name: "status",
        type: "enum",
        required: true,
        description: "Estado atual da tarefa",
        values: ["pending", "completed"],
      },
      {
        name: "priority",
        type: "enum",
        required: true,
        description: "Prioridade da tarefa",
        values: ["low", "medium", "high"],
      },
      { name: "due_date", type: "string (ISO date)", description: "Prazo de conclusão no formato YYYY-MM-DD" },
      { name: "assigned_to", type: "string (ref)", required: true, description: "UID do responsável" },
      { name: "assigned_name", type: "string", description: "Nome do responsável (desnormalizado)" },
      { name: "related_lead_id", type: "string (ref)", description: "ID do lead de origem (se criada por automação do CRM)" },
      { name: "related_lead_name", type: "string", description: "Nome do lead de origem (desnormalizado)" },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação" },
    ],
    relations: [
      { to: "profiles", type: "N:1", label: "atribuída a um usuário" },
      { to: "leads", type: "N:1", label: "pode ser originada de um lead (CRM automation)" },
    ],
    indexes: [
      "assigned_to + status — tarefas pendentes do usuário",
      "assigned_to + due_date — tarefas por prazo",
      "related_lead_id — tarefas de um lead específico",
      "priority + status — triagem por prioridade",
    ],
    securityNotes: [
      "Usuário lê apenas as próprias tarefas (assigned_to === seu UID)",
      "Admin e leader leem todas as tarefas",
      "Automações do CRM criam tarefas com o assigned_to do lead",
    ],
  },
  {
    id: "products",
    path: "/products/{productId}",
    icon: "🛍️",
    title: "Products",
    description:
      "Catálogo de produtos e serviços oferecidos pela agência. Usado para associar produtos a clientes (products_closed) e como referência no cadastro de leads (product_interest).",
    fields: [
      { name: "productId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "name", type: "string", required: true, description: "Nome do produto/serviço" },
      { name: "description", type: "string", description: "Descrição detalhada do produto" },
      { name: "price", type: "number (R$)", description: "Valor sugerido de venda em reais" },
      { name: "created_at", type: "Timestamp", required: true, description: "Data e hora de criação do produto" },
    ],
    relations: [
      { to: "clients", type: "N:N", label: "contratado por clientes (products_closed[])" },
      { to: "leads", type: "1:N", label: "referenciado como product_interest" },
    ],
    indexes: ["name ASC — listagem alfabética", "price ASC/DESC — ordenar por preço"],
    securityNotes: [
      "Regra isValidProduct() valida: name obrigatório, price >= 0",
      "Apenas admin e leader podem criar, editar e deletar produtos",
      "Todos os autenticados podem listar produtos",
    ],
  },
  {
    id: "settings",
    path: "/settings/agency",
    icon: "⚙️",
    title: "Settings",
    description:
      "Documento único com as configurações globais da agência. Armazenado no caminho fixo /settings/agency. Contém preferências de notificações, dados da agência e configurações de segurança.",
    fields: [
      { name: "agency_name", type: "string", description: "Nome da agência" },
      { name: "website", type: "string (URL)", description: "URL do site da agência" },
      { name: "logo_url", type: "string (URL)", description: "URL da logo da agência" },
      {
        name: "notifications",
        type: "Object",
        description:
          "Configurações de notificações: { new_leads: boolean, deadlines: boolean, comments: boolean, approvals: boolean }",
      },
      {
        name: "security",
        type: "Object",
        description: "Configurações de segurança: { two_factor: boolean }",
      },
    ],
    relations: [],
    securityNotes: [
      "Apenas admin pode ler e editar configurações",
      "Documento único com ID fixo 'agency'",
    ],
  },
  {
    id: "invitations",
    path: "/invitations/{inviteId}",
    icon: "✉️",
    title: "Invitations",
    description:
      "Controla convites enviados para novos membros da equipe. Ao aceitar o convite, o usuário faz login com Google e seu perfil é associado automaticamente com o role definido no convite.",
    fields: [
      { name: "inviteId", type: "string (doc ID)", required: true, description: "ID gerado automaticamente pelo Firestore" },
      { name: "email", type: "string", required: true, description: "E-mail do convidado" },
      { name: "role", type: "string (enum)", required: true, description: "Papel a ser atribuído: admin | leader | collaborator" },
      { name: "invited_at", type: "Timestamp", required: true, description: "Data e hora do envio do convite" },
      {
        name: "status",
        type: "enum",
        required: true,
        description: "Estado atual do convite",
        values: ["pending", "accepted"],
      },
    ],
    relations: [{ to: "profiles", type: "1:1", label: "resulta em um perfil ao ser aceito" }],
    indexes: ["email — verificar convite por e-mail", "status — listar convites pendentes"],
    securityNotes: [
      "Apenas admin pode criar e visualizar convites",
      "Ao aceitar convite, o perfil recebe is_active: true automaticamente",
    ],
  },
]

export const performanceRules = [
  {
    title: "Desnormalização Estratégica",
    description:
      "Campos como client_name, assigned_name e related_lead_name são armazenados diretamente nos documentos para evitar leituras extras (joins). No Firestore, cada leitura é cobrada — desnormalizar reduz custo e latência.",
    example: "deliveries.client_name evita buscar /clients/{id} só para exibir o nome na tabela",
  },
  {
    title: "Listeners em Tempo Real (onSnapshot)",
    description:
      "Coleções de alta frequência de atualização usam onSnapshot no cliente. Para coleções menos voláteis, getDocs() é preferível para reduzir listeners simultâneos e custo de leituras.",
    example: "leads, deliveries e projects usam onSnapshot. products usa getDocs com cache",
  },
  {
    title: "Índices Compostos",
    description:
      "Consultas com múltiplos campos de filtro E ordenação exigem índices compostos no Firestore. Devem ser criados via Firebase Console ou firestore.indexes.json antes do deploy em produção.",
    example: "team_id + pipeline_stage + created_at DESC para o Kanban por time",
  },
  {
    title: "Paginação e Limites",
    description:
      "Consultas sem limite podem retornar milhares de documentos. Usar limit() em listagens e startAfter() para paginação cursor-based. O Dashboard usa isWithinInterval para filtrar no cliente após busca limitada.",
    example: "getDocs(query(collection(db, 'leads'), orderBy('created_at', 'desc'), limit(50)))",
  },
  {
    title: "useMemo para Dados Derivados",
    description:
      "Cálculos como totais por coluna, variações de período, progresso de checkpoints e agrupamentos são memoizados com useMemo para evitar recomputações a cada re-render.",
    example: "const leadsByStage = useMemo(() => groupBy(leads, 'pipeline_stage'), [leads])",
  },
]

export const securityRules = [
  {
    rule: "isAdmin()",
    description: "Verifica se o usuário autenticado tem role = 'admin' no seu perfil. O email arrudaeduardo53@gmail.com é sempre tratado como admin.",
    code: `function isAdmin() {
  return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'admin'
    || request.auth.token.email == 'arrudaeduardo53@gmail.com';
}`,
  },
  {
    rule: "isLeader()",
    description: "Verifica se o usuário tem role = 'leader'.",
    code: `function isLeader() {
  return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'leader';
}`,
  },
  {
    rule: "isSameTeam(teamId)",
    description: "Verifica se o usuário pertence ao mesmo time do documento sendo acessado.",
    code: `function isSameTeam(teamId) {
  return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.team_id == teamId;
}`,
  },
  {
    rule: "isValidLead()",
    description: "Valida campos obrigatórios e formatos do documento lead antes de criar/atualizar.",
    code: `function isValidLead() {
  return request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.pipeline_stage is string
    && request.resource.data.pipeline_stage.size() > 0;
}`,
  },
]

export const crudOperations = [
  {
    collection: "Leads",
    operations: [
      {
        type: "CREATE",
        description: "Novo lead via modal do CRM",
        code: `await addDoc(collection(db, 'leads'), {
  name, email, phone, company_name,
  pipeline_stage: defaultStageId,
  temperature: 'warm',
  assigned_to: currentUser.uid,
  history: [{ date: Timestamp.now(), action: 'Lead criado', user_id, user_name }],
  created_at: Timestamp.now()
});`,
      },
      {
        type: "UPDATE",
        description: "Mover lead entre colunas (drag-and-drop)",
        code: `await updateDoc(doc(db, 'leads', leadId), {
  pipeline_stage: newStageId,
  history: arrayUnion({
    date: Timestamp.now(),
    action: \`Movido para "\${stageName}"\`,
    user_id: currentUser.uid,
    user_name: currentUser.displayName
  })
});`,
      },
      {
        type: "DELETE",
        description: "Excluir lead (somente admin/leader)",
        code: `await deleteDoc(doc(db, 'leads', leadId));`,
      },
      {
        type: "READ",
        description: "Listener em tempo real de todos os leads",
        code: `onSnapshot(collection(db, 'leads'), (snapshot) => {
  const leads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  setLeads(leads);
});`,
      },
    ],
  },
  {
    collection: "Projetos",
    operations: [
      {
        type: "UPDATE",
        description: "Atualizar checkpoint e recalcular progresso",
        code: `const updatedCheckpoints = checkpoints.map(cp =>
  cp.id === checkpointId ? { ...cp, completed: !cp.completed } : cp
);
const progress = Math.round(
  (updatedCheckpoints.filter(cp => cp.completed).length / updatedCheckpoints.length) * 100
);
await updateDoc(doc(db, 'projects', projectId), { checkpoints: updatedCheckpoints, progress });`,
      },
    ],
  },
  {
    collection: "Conversão Lead → Cliente",
    operations: [
      {
        type: "CREATE",
        description: "Criar cliente automaticamente ao mover para won_stage",
        code: `// Verificar duplicata por email
const q = query(collection(db, 'clients'), where('email', '==', lead.email));
const existing = await getDocs(q);
if (existing.empty) {
  await addDoc(collection(db, 'clients'), {
    name: lead.name, company: lead.company_name,
    email: lead.email, monthly_value: lead.estimated_value || 0,
    status: 'active', health: 'good',
    team_id: lead.team_id, created_at: Timestamp.now()
  });
}`,
      },
    ],
  },
]
