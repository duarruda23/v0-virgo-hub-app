import { Sidebar } from "@/components/db-spec/Sidebar"
import { CollectionCard } from "@/components/db-spec/CollectionCard"
import { ERDiagram } from "@/components/db-spec/ERDiagram"
import { CRUDSection, SecurityRulesSection } from "@/components/db-spec/CRUDSection"
import { PerformanceSection } from "@/components/db-spec/PerformanceSection"
import { ScalabilitySection } from "@/components/db-spec/ScalabilitySection"
import { collections } from "@/components/db-spec/data"

const stats = [
  { label: "Coleções", value: "10", icon: "🗂️", color: "bg-yellow-400" },
  { label: "Campos Mapeados", value: "80+", icon: "🔤", color: "bg-blue-400" },
  { label: "Relacionamentos", value: "15", icon: "🔗", color: "bg-green-400" },
  { label: "Índices Compostos", value: "22+", icon: "⚡", color: "bg-red-400" },
]

const techStack = [
  { name: "Firebase Firestore", desc: "Banco de dados NoSQL em tempo real", badge: "v12" },
  { name: "Firebase Auth", desc: "Autenticação com Google Provider", badge: "v12" },
  { name: "Firestore Security Rules", desc: "Autorização baseada em roles", badge: "v2" },
  { name: "Cloud Firestore Indexes", desc: "Índices compostos para queries", badge: "JSON" },
]

export default function DatabaseSpecPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Sidebar />

      {/* Conteúdo principal com offset para sidebar */}
      <main className="lg:ml-64">
        {/* Header */}
        <div className="bg-black text-white border-b-4 border-yellow-400">
          <div className="px-6 lg:px-10 py-8 lg:py-12">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-16 h-16 bg-yellow-400 border-4 border-yellow-300 flex items-center justify-center font-black text-black text-3xl flex-shrink-0">
                V
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="font-black text-3xl lg:text-4xl text-white leading-none">Virgo Hub</h1>
                  <span className="bg-yellow-400 text-black font-black text-xs px-3 py-1 border-2 border-yellow-300">
                    ESPECIFICAÇÃO DE BANCO DE DADOS
                  </span>
                </div>
                <p className="text-gray-400 text-sm lg:text-base mt-2 max-w-2xl leading-relaxed">
                  Documentação técnica completa do esquema Firestore para o sistema de gestão de agência de marketing digital.
                  Inclui modelo de dados, relacionamentos, regras de segurança, índices e boas práticas de manutenção.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {techStack.map((t) => (
                    <div key={t.name} className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5">
                      <div>
                        <p className="text-xs font-bold text-white">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                      <span className="bg-yellow-400 text-black font-black text-xs px-1.5 py-0.5 ml-1">{t.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-8 space-y-10">
          {/* Visão Geral */}
          <section id="overview">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
                  <div className={`${stat.color} border-b-2 border-black px-4 py-2 flex items-center gap-2`}>
                    <span className="text-xl">{stat.icon}</span>
                    <span className="font-black text-3xl">{stat.value}</span>
                  </div>
                  <div className="px-4 py-2">
                    <p className="font-black text-sm text-gray-700">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo arquitetural */}
            <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
              <div className="bg-yellow-400 border-b-2 border-black px-5 py-3">
                <h2 className="font-black text-base">Visão Arquitetural</h2>
              </div>
              <div className="p-5 grid md:grid-cols-3 gap-5">
                <div className="space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider border-b-2 border-black pb-1">
                    Paradigma
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O Virgo Hub usa <strong>Cloud Firestore</strong> (NoSQL orientado a documentos).
                    Dados são organizados em <strong>coleções</strong> e <strong>documentos</strong>,
                    sem joins — relacionamentos são resolvidos via referências (IDs) ou desnormalização.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider border-b-2 border-black pb-1">
                    Modelo de Acesso
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Listeners <code className="bg-gray-100 px-1 text-xs">onSnapshot</code> em tempo real
                    para coleções críticas (leads, projects). Leituras únicas <code className="bg-gray-100 px-1 text-xs">getDocs</code> para
                    dados estáticos (products, crm_stages). Estado global via <strong>Zustand</strong>.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider border-b-2 border-black pb-1">
                    Autorização
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    3 papéis: <strong>admin</strong> (acesso total), <strong>leader</strong> (gestão de time)
                    e <strong>collaborator</strong> (visão restrita). Implementado via
                    <strong> Firestore Security Rules</strong> com funções helper no servidor.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Diagrama ER */}
          <section id="er-diagram">
            <SectionTitle number="01" title="Diagrama de Relacionamentos" />
            <ERDiagram />
          </section>

          {/* Coleções */}
          <section id="collections">
            <SectionTitle number="02" title="Coleções do Banco de Dados" />
            <div className="space-y-4">
              {collections.map((collection, i) => (
                <CollectionCard key={collection.id} collection={collection} index={i} />
              ))}
            </div>
          </section>

          {/* CRUD */}
          <section id="crud">
            <SectionTitle number="03" title="Operações CRUD" />
            <CRUDSection />
          </section>

          {/* Segurança */}
          <section id="security">
            <SectionTitle number="04" title="Segurança e Autorização" />
            <SecurityRulesSection />
          </section>

          {/* Performance */}
          <section id="performance">
            <SectionTitle number="05" title="Desempenho e Otimizações" />
            <PerformanceSection />
          </section>

          {/* Escalabilidade */}
          <section id="scalability">
            <SectionTitle number="06" title="Escalabilidade e Manutenção" />
            <ScalabilitySection />
          </section>

          {/* Footer */}
          <footer className="border-t-4 border-black pt-6 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-black">
                  V
                </div>
                <div>
                  <p className="font-black text-sm">Virgo Hub — Database Specification</p>
                  <p className="text-xs text-gray-500">Firestore NoSQL · Firebase v12 · pt-BR</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["10 Coleções", "3 Papéis", "6 Etapas CRM", "22+ Índices", "LGPD Ready"].map((tag) => (
                  <span key={tag} className="border-2 border-black px-2 py-1 text-xs font-black bg-white">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div className="bg-black text-yellow-400 font-black text-xl w-12 h-12 flex items-center justify-center border-2 border-black flex-shrink-0">
        {number}
      </div>
      <h2 className="font-black text-2xl border-b-4 border-yellow-400 pb-1">{title}</h2>
    </div>
  )
}
