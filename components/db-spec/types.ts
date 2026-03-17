export interface FieldDef {
  name: string
  type: string
  required?: boolean
  description: string
  values?: string[]
}

export interface CollectionDef {
  id: string
  path: string
  icon: string
  title: string
  description: string
  fields: FieldDef[]
  relations?: { to: string; type: "1:1" | "1:N" | "N:N"; label: string }[]
  subcollections?: { path: string; title: string }[]
  indexes?: string[]
  securityNotes?: string[]
}
