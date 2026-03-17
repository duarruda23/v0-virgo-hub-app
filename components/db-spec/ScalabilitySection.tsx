"use client"

const practices = [
  {
    category: "Estrutura de Dados",
    color: "bg-blue-400",
    items: [
      "Desnormalizar campos de leitura frequente (client_name, assigned_name) para evitar leituras encadeadas",
      "Usar arrays (responsible_ids, products_closed) para relacionamentos N:N leves (máx. ~100 itens)",
      "Subcoleções para dados aninhados com grande volume (tasks por projeto)",
      "Objetos embutidos para dados pequenos e sempre lidos juntos (checkpoints, history items)",
      "Evitar arrays com mais de 500 itens — usar subcoleção neste caso",
    ],
  },
  {
    category: "Consistência de Dados",
    color: "bg-green-400",
    items: [
      "Validar dados no cliente com TypeScript interfaces antes de escrever no Firestore",
      "Usar transações (runTransaction) para operações atômicas como conversão Lead → Cliente",
      "Batch writes para inserções em massa (ex: importação CSV de clientes/projetos)",
      "Verificar duplicatas por email antes de criar clientes (leads converted)",
      "Manter history como append-only — nunca deletar itens do array",
    ],
  },
  {
    category: "Escalabilidade",
    color: "bg-yellow-400",
    items: [
      "Usar limit() em todas as queries — nunca buscar toda a coleção sem limite",
      "Paginação cursor-based com startAfter() para listas longas",
      "Índices compostos criados via firestore.indexes.json para queries com múltiplos filtros",
      "Separar leituras em tempo real (onSnapshot) de leituras pontuais (getDocs) por frequência",
      "Considerar Cloud Functions para lógica pesada (relatórios, agregações complexas)",
    ],
  },
  {
    category: "Manutenção e Migrações",
    color: "bg-purple-400",
    items: [
      "Suportar formato legado nos dados (getNormalizedCheckpoints() para checkpoints antigos)",
      "Versionar mudanças de schema com scripts de migração em Cloud Functions",
      "Nunca deletar campos — marcar como deprecated e ignorar no código novo",
      "Usar emulador local do Firestore para desenvolvimento e testes",
      "Monitorar uso e custos via Firebase Console — alertas de limite de leituras/gravações",
    ],
  },
  {
    category: "Segurança",
    color: "bg-red-400",
    items: [
      "Nunca expor chaves de API do Firebase em variáveis de ambiente do servidor",
      "Configurar regras de segurança Firestore como primeira linha de defesa",
      "Validar dados nas Security Rules (isValidLead, isValidProduct) além do cliente",
      "Revogar acesso imediatamente ao setar is_active: false no perfil",
      "Auditar acesso com Firebase App Check em produção para bloquear clientes não autorizados",
    ],
  },
  {
    category: "Backups e Recuperação",
    color: "bg-orange-400",
    items: [
      "Ativar exports automáticos do Firestore para Google Cloud Storage",
      "Definir política de retenção de dados (LGPD): histórico de leads, dados pessoais",
      "Testar restore periodicamente em ambiente de staging",
      "Documentar campos sensíveis (email, CNPJ, telefone) para conformidade LGPD",
      "Implementar soft delete (campo deleted_at) antes de deleção física para recuperação",
    ],
  },
]

const authFlow = [
  { step: "1", label: "Login Google", desc: "signInWithPopup → GoogleAuthProvider", color: "bg-blue-400" },
  { step: "2", label: "Verificar Perfil", desc: "onAuthStateChanged → getDocs profiles/{uid}", color: "bg-purple-400" },
  { step: "3", label: "Novo Usuário?", desc: "Se não existe → criar perfil com is_active: false", color: "bg-orange-400" },
  { step: "4", label: "Admin Aprova", desc: "Admin seta is_active: true via painel de equipe", color: "bg-yellow-400" },
  { step: "5", label: "Acesso Liberado", desc: "onSnapshot em profiles/{uid} detecta mudança", color: "bg-green-400" },
]

export function ScalabilitySection() {
  return (
    <div className="space-y-6">
      {/* Auth Flow */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
        <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div>
            <h3 className="font-black text-base">Fluxo de Autenticação e Ativação</h3>
            <p className="text-xs text-gray-400">Sequência de eventos do login até acesso liberado</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-0">
            {authFlow.map((step, i) => (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center min-w-[130px]">
                  <div className={`${step.color} border-2 border-black w-10 h-10 flex items-center justify-center font-black text-lg`}>
                    {step.step}
                  </div>
                  <div className="border-2 border-t-0 border-black p-2 text-center w-full">
                    <p className="font-black text-xs">{step.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-tight">{step.desc}</p>
                  </div>
                </div>
                {i < authFlow.length - 1 && (
                  <div className="font-black text-2xl text-gray-400 mx-1 mb-8">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boas práticas */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
        <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
          <span className="text-xl">📐</span>
          <div>
            <h3 className="font-black text-base">Escalabilidade e Boas Práticas</h3>
            <p className="text-xs text-gray-400">Diretrizes para manutenção e crescimento sustentável</p>
          </div>
        </div>
        <div className="p-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {practices.map((practice) => (
            <div key={practice.category} className="border-2 border-black">
              <div className={`${practice.color} border-b-2 border-black px-3 py-2`}>
                <h4 className="font-black text-sm">{practice.category}</h4>
              </div>
              <ul className="p-3 space-y-2">
                {practice.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="font-black text-black mt-0.5 shrink-0">▸</span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
