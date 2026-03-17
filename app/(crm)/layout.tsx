"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CRMSidebar } from "@/components/crm/CRMSidebar";
import { CRMHeader } from "@/components/crm/CRMHeader";
import { useAuthStore } from "@/lib/store";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-black border-t-yellow-400 rounded-full animate-spin" />
          <span className="font-semibold text-sm">Redirecionando...</span>
        </div>
      </div>
    );
  }

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
