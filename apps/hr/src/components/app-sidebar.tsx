import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Clock,
  Briefcase,
  Calendar as CalendarIcon,
  Settings,
  HelpCircle,
  Bell,
  MessageSquare,
  Ticket,
  BookOpen,
  UserCircle,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: MessageSquare, label: "Inbox", href: "#" },
    { icon: Bell, label: "Notification", href: "#" },
    { icon: Ticket, label: "Ticket", href: "#" },
    { icon: BookOpen, label: "Knowledge Base", href: "#" },
    { icon: Users, label: "Customer", href: "#" },
    { icon: MessageCircle, label: "Forum", href: "#" },
    { icon: LayoutDashboard, label: "Report", href: "#" },
  ];

  const conversationItems = [
    { icon: UserCircle, label: "Call", href: "#", extra: "(123)45678...", badge: "1" },
    { icon: MessageSquare, label: "Side Conversa...", href: "#", extra: "0" },
  ];

  const favoriteItems = [{ icon: MoreHorizontal, label: "Add new", href: "#" }];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">
          FIK
        </div>
        <div>
          <div className="font-bold text-sm">Fikri Studio</div>
          <div className="text-xs text-muted-foreground">Agent Admin</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Conversation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider font-medium">
            Favorites
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoriteItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-100">
        <SidebarMenuButton asChild>
          <Link
            href="#"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </Link>
        </SidebarMenuButton>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center text-[8px] text-white">
            k
          </div>
          <span className="text-[10px] font-semibold">kirridesk</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
