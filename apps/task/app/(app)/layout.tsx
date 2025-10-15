import { SidebarProvider } from "@/components/sidebar-provider";

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}


