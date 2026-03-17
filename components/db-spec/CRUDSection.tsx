"use client"

import { useState } from "react"
import { crudOperations, securityRules } from "./data"

const crudColors: Record<string, string> = {
  CREATE: "bg-green-500",
  READ: "bg-blue-500",
  UPDATE: "bg-yellow-400",
  DELETE: "bg-red-500",
}

export function CRUDSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
      <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
        <span className="text-xl">⚡</span>
        <div>
          <h3 className="font-black text-base">Operações CRUD Principais</h3>
          <p className="text-xs text-gray-400">Exemplos de código TypeScript para operações com Firestore</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black overflow-x-auto">
        {crudOperations.map((op, i) => (
          <button
            key={op.collection}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-3 font-black text-sm whitespace-nowrap border-r-2 border-black transition-colors ${
              activeTab === i ? "bg-yellow-400 text-black" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {op.collection}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {crudOperations[activeTab].operations.map((op) => (
          <div key={op.type} className="border-2 border-black overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b-2 border-black">
              <span className={`${crudColors[op.type]} text-white text-xs font-black px-2 py-0.5 border border-black`}>
                {op.type}
              </span>
              <span className="text-sm font-bold text-gray-700">{op.description}</span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 text-xs overflow-x-auto leading-relaxed font-mono">
              <code>{op.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SecurityRulesSection() {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
      <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
        <span className="text-xl">🔒</span>
        <div>
          <h3 className="font-black text-base">Regras de Segurança Firestore</h3>
          <p className="text-xs text-gray-400">Funções helper implementadas nas Security Rules</p>
        </div>
      </div>

      <div className="p-5 grid gap-4 md:grid-cols-2">
        {securityRules.map((rule) => (
          <div key={rule.rule} className="border-2 border-black overflow-hidden">
            <div className="bg-red-500 text-white px-4 py-2 flex items-center gap-2">
              <span className="font-mono font-black text-sm">{rule.rule}</span>
            </div>
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs text-gray-600">{rule.description}</p>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 text-xs overflow-x-auto leading-relaxed font-mono">
              <code>{rule.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
