import { CRMSidebar } from "@/components/crm/CRMSidebar";
import { CRMHeader } from "@/components/crm/CRMHeader";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <CRMSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <CRMHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
