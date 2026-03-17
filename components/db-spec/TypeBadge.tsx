"use client"

interface TypeBadgeProps {
  type: string
}

const typeColors: Record<string, string> = {
  "string": "bg-blue-100 text-blue-800 border-blue-300",
  "string (doc ID)": "bg-purple-100 text-purple-800 border-purple-300",
  "string (ref)": "bg-orange-100 text-orange-800 border-orange-300",
  "string (URL)": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "string (hex)": "bg-pink-100 text-pink-800 border-pink-300",
  "string (ISO date)": "bg-teal-100 text-teal-800 border-teal-300",
  "string (textarea)": "bg-blue-100 text-blue-800 border-blue-300",
  "number (R$)": "bg-green-100 text-green-800 border-green-300",
  "number (0–100)": "bg-green-100 text-green-800 border-green-300",
  "number": "bg-green-100 text-green-800 border-green-300",
  "boolean": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "enum": "bg-red-100 text-red-800 border-red-300",
  "Timestamp": "bg-gray-100 text-gray-800 border-gray-300",
  "Array<Object>": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "string[]": "bg-violet-100 text-violet-800 border-violet-300",
  "Object": "bg-indigo-100 text-indigo-800 border-indigo-300",
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colorClass = typeColors[type] ?? "bg-gray-100 text-gray-700 border-gray-300"
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono font-semibold border rounded ${colorClass}`}
      style={{ whiteSpace: "nowrap" }}
    >
      {type}
    </span>
  )
}
