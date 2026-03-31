import { useAuthStore } from "@/lib/store";

export type DashboardView =
  | "admin"
  | "leader"
  | "designer"
  | "video_editor"
  | "seller"
  | "social_media"
  | "collaborator";

export function useDashboardView(): DashboardView {
  const user = useAuthStore((s) => s.user);
  if (!user) return "collaborator";

  const role = user.role;
  const specialty = (user as typeof user & { specialty?: string }).specialty;

  if (role === "admin") return "admin";
  if (role === "leader") return "leader";

  // collaborators — fallback by specialty or department
  const key = specialty ?? user.department ?? "";
  if (key === "designer") return "designer";
  if (key === "video_editor" || key === "editor") return "video_editor";
  if (key === "seller" || key === "comercial" || key === "vendas") return "seller";
  if (key === "social_media" || key === "social" || key === "midias") return "social_media";

  return "collaborator";
}
