import { SidebarProvider } from "@/components/sidebar-provider";
import { ProfileProvider } from "@/contexts/profile-context";

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ProfileProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ProfileProvider>
  );
}


