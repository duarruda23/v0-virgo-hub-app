"use client"

import { useState } from "react"
import { TypeBadge } from "./TypeBadge"
import type { CollectionDef } from "./types"

interface CollectionCardProps {
  collection: CollectionDef
  index: number
}

const relationColors: Record<string, string> = {
  "1:1": "bg-purple-100 text-purple-700 border-purple-300",
  "1:N": "bg-blue-100 text-blue-700 border-blue-300",
  "N:1": "bg-orange-100 text-orange-700 border-orange-300",
  "N:N": "bg-green-100 text-green-700 border-green-300",
}

export function CollectionCard({ collection, index }: CollectionCardProps) {
  const [expanded, setExpanded] = useState(index < 2)

  return (
    <div
      id={collection.id}
      className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-4 p-5 bg-black text-white hover:bg-yellow-400 hover:text-black transition-colors text-left group"
      >
        <span className="text-3xl leading-none mt-0.5">{collection.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-black text-xl tracking-tight">{collection.title}</span>
            <span className="font-mono text-sm opacity-60 group-hover:opacity-80 truncate">{collection.path}</span>
          </div>
          <p className="text-sm mt-1 opacity-70 group-hover:opacity-90 leading-relaxed line-clamp-2">
            {collection.description}
          </p>
        </div>
        <span className="text-2xl font-black ml-2 shrink-0">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="p-5 space-y-6">
          {/* Descrição completa */}
          <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-yellow-400 pl-4">
            {collection.description}
          </p>

          {/* Campos */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 border-2 border-black inline-block" />
              Campos ({collection.fields.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-black text-sm">
                <thead>
                  <tr className="bg-yellow-400 border-b-2 border-black">
                    <th className="text-left px-3 py-2 font-black text-xs uppercase tracking-wider border-r-2 border-black w-36">
                      Campo
                    </th>
                    <th className="text-left px-3 py-2 font-black text-xs uppercase tracking-wider border-r-2 border-black w-44">
                      Tipo
                    </th>
                    <th className="text-left px-3 py-2 font-black text-xs uppercase tracking-wider border-r-2 border-black w-14">
                      Req.
                    </th>
                    <th className="text-left px-3 py-2 font-black text-xs uppercase tracking-wider">
                      Descrição
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collection.fields.map((field, i) => (
                    <tr
                      key={field.name}
                      className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`}
                    >
                      <td className="px-3 py-2 font-mono font-bold text-xs border-r-2 border-gray-200 align-top">
                        {field.name}
                      </td>
                      <td className="px-3 py-2 border-r-2 border-gray-200 align-top">
                        <TypeBadge type={field.type} />
                      </td>
                      <td className="px-3 py-2 text-center border-r-2 border-gray-200 align-top">
                        {field.required ? (
                          <span className="inline-block w-4 h-4 bg-red-500 text-white text-xs font-black flex items-center justify-center">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600 align-top">
                        <span>{field.description}</span>
                        {field.values && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {field.values.map((v) => (
                              <span key={v} className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 text-xs font-mono rounded">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relacionamentos */}
          {collection.relations && collection.relations.length > 0 && (
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 border-2 border-black inline-block" />
                Relacionamentos
              </h4>
              <div className="flex flex-wrap gap-2">
                {collection.relations.map((rel) => (
                  <div
                    key={`${rel.to}-${rel.type}`}
                    className="flex items-center gap-2 border-2 border-black px-3 py-1.5 text-xs"
                  >
                    <span className={`font-black px-1.5 py-0.5 border ${relationColors[rel.type]} font-mono`}>
                      {rel.type}
                    </span>
                    <span className="font-mono font-bold text-gray-700">/{rel.to}</span>
                    <span className="text-gray-500">— {rel.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subcoleções */}
          {collection.subcollections && collection.subcollections.length > 0 && (
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 border-2 border-black inline-block" />
                Subcoleções
              </h4>
              {collection.subcollections.map((sub) => (
                <div key={sub.path} className="border-2 border-purple-400 bg-purple-50 p-3">
                  <p className="font-mono font-bold text-sm text-purple-800">{sub.path}</p>
                  <p className="text-xs text-purple-600 mt-1">{sub.title}</p>
                </div>
              ))}
            </div>
          )}

          {/* Índices */}
          {collection.indexes && collection.indexes.length > 0 && (
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 border-2 border-black inline-block" />
                Índices Recomendados
              </h4>
              <ul className="space-y-1">
                {collection.indexes.map((idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-black mt-0.5">▶</span>
                    <code className="text-gray-700 font-mono">{idx}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Segurança */}
          {collection.securityNotes && collection.securityNotes.length > 0 && (
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-400 border-2 border-black inline-block" />
                Regras de Segurança
              </h4>
              <ul className="space-y-1">
                {collection.securityNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-xs">
                    <span className="text-red-500 font-black mt-0.5">•</span>
                    <span className="text-gray-700">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
