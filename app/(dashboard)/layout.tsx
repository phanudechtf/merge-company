import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { ProfileProvider } from "@/components/layout/ProfileContext";
import { NotificationProvider } from "@/components/layout/NotificationContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProfileProvider>
      <NotificationProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-ivory">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
      </NotificationProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}
