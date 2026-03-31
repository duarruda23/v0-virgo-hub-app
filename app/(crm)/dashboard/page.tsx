"use client";
import dynamic from "next/dynamic";
import { useDashboardView } from "@/hooks/use-dashboard-view";

const DashboardContent      = dynamic(() => import("@/components/crm/DashboardContent"), { ssr: false });
const AdminDashboard        = dynamic(() => import("@/components/crm/dashboards/AdminDashboard"), { ssr: false });
const SectorLeaderDashboard = dynamic(() => import("@/components/crm/dashboards/SectorLeaderDashboard"), { ssr: false });
const CollaboratorDashboard = dynamic(() => import("@/components/crm/dashboards/CollaboratorDashboard"), { ssr: false });

export default function DashboardPage() {
  const view = useDashboardView();

  if (view === "admin") return <AdminDashboard />;
  if (view === "leader") return <SectorLeaderDashboard />;
  if (
    view === "designer" ||
    view === "video_editor" ||
    view === "seller" ||
    view === "social_media" ||
    view === "collaborator"
  ) return <CollaboratorDashboard view={view} />;

  // Fallback: dashboard original para usuários sem role definido ainda
  return <DashboardContent />;
}
