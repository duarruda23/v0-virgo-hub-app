"use client"

const nodes = [
  { id: "profiles", label: "profiles", x: 50, y: 45, color: "#a78bfa" },
  { id: "teams", label: "teams", x: 50, y: 160, color: "#60a5fa" },
  { id: "leads", label: "leads", x: 200, y: 45, color: "#fb923c" },
  { id: "crm_stages", label: "crm_stages", x: 380, y: 45, color: "#f87171" },
  { id: "clients", label: "clients", x: 200, y: 180, color: "#34d399" },
  { id: "projects", label: "projects", x: 380, y: 165, color: "#60a5fa" },
  { id: "deliveries", label: "deliveries", x: 550, y: 45, color: "#f472b6" },
  { id: "tasks", label: "tasks", x: 550, y: 165, color: "#fbbf24" },
  { id: "products", label: "products", x: 200, y: 300, color: "#a3e635" },
  { id: "settings", label: "settings", x: 400, y: 300, color: "#94a3b8" },
  { id: "invitations", label: "invitations", x: 560, y: 300, color: "#c084fc" },
]

const edges = [
  { from: "profiles", to: "teams", label: "N:1" },
  { from: "leads", to: "crm_stages", label: "N:1" },
  { from: "leads", to: "profiles", label: "N:1" },
  { from: "leads", to: "clients", label: "→ won" },
  { from: "leads", to: "tasks", label: "1:N auto" },
  { from: "clients", to: "teams", label: "N:1" },
  { from: "clients", to: "projects", label: "1:N" },
  { from: "clients", to: "deliveries", label: "1:N" },
  { from: "clients", to: "products", label: "N:N" },
  { from: "projects", to: "tasks", label: "sub" },
  { from: "deliveries", to: "profiles", label: "N:1" },
  { from: "tasks", to: "profiles", label: "N:1" },
]

function getNodeCenter(id: string) {
  const node = nodes.find((n) => n.id === id)
  if (!node) return { x: 0, y: 0 }
  const w = 105
  const h = 32
  return { x: node.x + w / 2, y: node.y + h / 2 }
}

export function ERDiagram() {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
      <div className="bg-black text-white px-5 py-3 flex items-center gap-3">
        <span className="text-xl">🔗</span>
        <div>
          <h3 className="font-black text-base">Diagrama de Relacionamentos</h3>
          <p className="text-xs text-gray-400">Mapa visual das coleções Firestore e seus relacionamentos</p>
        </div>
      </div>
      <div className="p-5 overflow-x-auto">
        <svg
          viewBox="0 0 720 360"
          className="w-full"
          style={{ minWidth: 600, maxHeight: 380 }}
          aria-label="Diagrama de entidade-relacionamento do banco de dados Virgo Hub"
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
            </marker>
          </defs>

          {/* Arestas */}
          {edges.map((edge) => {
            const from = getNodeCenter(edge.from)
            const to = getNodeCenter(edge.to)
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow)"
                />
                <rect
                  x={mx - 18} y={my - 9}
                  width={36} height={16}
                  rx={2}
                  fill="white"
                  stroke="#d1d5db"
                  strokeWidth={1}
                />
                <text
                  x={mx} y={my + 4}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#374151"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {/* Nós */}
          {nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x} y={node.y}
                width={105} height={32}
                rx={0}
                fill={node.color}
                stroke="black"
                strokeWidth={2}
              />
              <rect
                x={node.x + 3} y={node.y + 3}
                width={105} height={32}
                rx={0}
                fill="black"
                style={{ zIndex: -1 }}
              />
              <rect
                x={node.x} y={node.y}
                width={105} height={32}
                rx={0}
                fill={node.color}
                stroke="black"
                strokeWidth={2}
              />
              <text
                x={node.x + 52.5}
                y={node.y + 21}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fontFamily="monospace"
                fill="black"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t-2 border-black">
          {[
            { color: "#a78bfa", label: "Autenticação/Usuários" },
            { color: "#fb923c", label: "Pipeline de Vendas" },
            { color: "#34d399", label: "Clientes" },
            { color: "#60a5fa", label: "Projetos/Times" },
            { color: "#fbbf24", label: "Tarefas" },
            { color: "#f472b6", label: "Entregas" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-black flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-8 border-t-2 border-dashed border-gray-400" />
            <span className="text-xs text-gray-500">relacionamento</span>
          </div>
        </div>
      </div>
    </div>
  )
}
