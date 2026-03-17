"use client"

import { performanceRules } from "./data"

const icons = ["🗄️", "📡", "⚡", "📄", "🧮"]

export function PerformanceSection() {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
      <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
        <span className="text-xl">🚀</span>
        <div>
          <h3 className="font-black text-base">Desempenho e Boas Práticas</h3>
          <p className="text-xs text-gray-400">Estratégias de otimização para o Firestore em produção</p>
        </div>
      </div>

      <div className="p-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {performanceRules.map((rule, i) => (
          <div key={rule.title} className="border-2 border-black flex flex-col">
            <div className="bg-yellow-400 border-b-2 border-black px-4 py-3 flex items-center gap-2">
              <span className="text-xl">{icons[i]}</span>
              <h4 className="font-black text-sm">{rule.title}</h4>
            </div>
            <div className="p-4 flex-1 space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">{rule.description}</p>
              <div className="border-l-4 border-black pl-3 bg-gray-50 p-2">
                <p className="text-xs font-mono text-gray-700">{rule.example}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
