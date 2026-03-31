import { useAuthStore } from "@/lib/store";
import type { Role } from "@/lib/types";

// Hierarquia: admin > leader > collaborator
const ROLE_RANK: Record<Role, number> = { admin: 3, leader: 2, collaborator: 1 };

export function usePermissions() {
  const user = useAuthStore((s) => s.currentUser);
  const role: Role = (user?.role as Role) ?? "collaborator";
  const rank = ROLE_RANK[role] ?? 1;

  return {
    role,
    isAdmin: role === "admin",
    isLeader: role === "leader" || role === "admin",
    isCollaborator: role === "collaborator",
    can: (minRole: Role) => rank >= ROLE_RANK[minRole],
  };
}
