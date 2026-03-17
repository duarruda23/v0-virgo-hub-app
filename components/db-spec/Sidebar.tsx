"use client"

import { useState } from "react"
import { collections } from "./data"

const sections = [
  { id: "overview", label: "Visão Geral" },
  { id: "er-diagram", label: "Diagrama ER" },
  { id: "collections", label: "Coleções" },
  { id: "crud", label: "Operações CRUD" },
  { id: "security", label: "Segurança" },
  { id: "performance", label: "Desempenho" },
  { id: "scalability", label: "Escalabilidade" },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    setOpen(false)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-yellow-400 border-2 border-black w-10 h-10 flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_#000]"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white z-50 flex flex-col transition-transform duration-200 border-r-2 border-black
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-5 border-b-2 border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-yellow-300 flex items-center justify-center font-black text-black text-xl">
              V
            </div>
            <div>
              <p className="font-black text-sm text-white leading-tight">Virgo Hub</p>
              <p className="text-xs text-gray-400">Especificação de BD</p>
            </div>
          </div>
        </div>

        {/* Seções principais */}
        <div className="p-3 border-b-2 border-gray-800">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 px-2 mb-2">Seções</p>
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-yellow-400 hover:text-black transition-colors font-medium"
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Coleções */}
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 px-2 mb-2">Coleções</p>
          <nav className="space-y-0.5">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => scrollTo(c.id)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-yellow-400 hover:text-black transition-colors font-mono flex items-center gap-2"
              >
                <span className="text-base">{c.icon}</span>
                <span className="text-xs">{c.id}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Firestore NoSQL · Firebase v12
          </p>
        </div>
      </aside>
    </>
  )
}
