"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Users,
    BarChart3,
    LayoutDashboard,
    FileBadge2Icon,
    Building2,
    UserCheck,
    Calendar,
    DollarSign,
    Trophy,
    FileText,
    Clock,
    Package,
    LogOut,
    GraduationCap,
    Briefcase,
    MessageSquare,
    Leaf,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Bell,
    Settings,
    User,
    Menu, Calendar1,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    href: string
    children?: NavItem[]
}

const navigationItems = {
    admin: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
        {
            icon: Building2,
            label: "Workspace",
            href: "/admin/workspace",
            children: [
                { icon: Users, label: "User Management", href: "/admin/users" },
                { icon: Building2, label: "HR Management", href: "/admin/hr" },
                { icon: GraduationCap, label: "Alumni Network", href: "/admin/alumni" },
                { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Alumni",
            href: "/alumni/dashboard",
            children: [
                { icon: Users, label: "Alumni Directory", href: "/alumni/directory" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
    ],
    hr_staff: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/hr/dashboard" },
        {
            icon: Building2,
            label: "Workspace",
            href: "/hr/workspace",
            children: [
                { icon: FileBadge2Icon, label: "Recruitment", href: "/hr/recruitment" },
                { icon: UserCheck, label: "Onboarding", href: "/hr/onboarding" },
                { icon: FileText, label: "Documents", href: "/hr/documents" },
                { icon: Users, label: "Employees", href: "/hr/employees" },
                { icon: Calendar1, label: "Events", href: "/hr/events" },
                { icon: Clock, label: "Attendance", href: "/hr/attendance" },
                { icon: Calendar, label: "Leave Management", href: "/hr/leave" },
                { icon: DollarSign, label: "Payroll", href: "/hr/payroll" },
                { icon: Trophy, label: "Performance", href: "/hr/performance" },
                { icon: Package, label: "Assets", href: "/hr/assets" },
                { icon: LogOut, label: "Offboarding", href: "/hr/offboarding" },
                { icon: MessageSquare, label: "Helpdesk", href: "/hr/helpdesk" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Alumni",
            href: "/alumni/dashboard",
            children: [
                { icon: Users, label: "Alumni Directory", href: "/alumni/directory" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
    ],
    employee: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/employee/dashboard" },
        {
            icon: Building2,
            label: "Workspace",
            href: "/employee/workspace",
            children: [
                { icon: Users, label: "My Profile", href: "/employee/profile" },
                { icon: Clock, label: "Attendance", href: "/employee/attendance" },
                { icon: Calendar, label: "Leave Requests", href: "/employee/leave" },
                { icon: DollarSign, label: "Payslips", href: "/employee/payroll" },
                { icon: Trophy, label: "Performance", href: "/employee/performance" },
                { icon: Package, label: "My Assets", href: "/employee/assets" },
                { icon: MessageSquare, label: "Support", href: "/employee/support" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Alumni",
            href: "/alumni/dashboard",
            children: [
                { icon: Users, label: "Alumni Directory", href: "/alumni/directory" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
    ],
    fellow: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/fellow/dashboard" },
        {
            icon: Building2,
            label: "Workspace",
            href: "/fellow/workspace",
            children: [
                { icon: Users, label: "My Profile", href: "/fellow/profile" },
                { icon: GraduationCap, label: "Fellowship Progress", href: "/fellow/progress" },
                { icon: FileText, label: "Projects", href: "/fellow/projects" },
                { icon: Users, label: "Mentorship", href: "/fellow/mentorship" },
                { icon: Calendar, label: "Events", href: "/fellow/events" },
                { icon: Trophy, label: "Performance", href: "/fellow/performance" },
                { icon: MessageSquare, label: "Support", href: "/fellow/support" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Alumni",
            href: "/alumni/dashboard",
            children: [
                { icon: Users, label: "Alumni Directory", href: "/alumni/directory" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
    ],
    alumni: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/alumni/dashboard" },
        {
            icon: Building2,
            label: "Workspace",
            href: "/alumni/workspace",
            children: [
                { icon: Users, label: "My Profile", href: "/alumni/profile" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: GraduationCap, label: "Alumni Network", href: "/alumni/network" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Alumni",
            href: "/alumni/dashboard",
            children: [
                { icon: Users, label: "Alumni Directory", href: "/alumni/directory" },
                { icon: Briefcase, label: "Job Opportunities", href: "/alumni/jobs" },
                { icon: Users, label: "Mentorship", href: "/alumni/mentorship" },
                { icon: Calendar, label: "Events", href: "/alumni/events" },
                { icon: Trophy, label: "Achievements", href: "/alumni/achievements" },
                { icon: FileText, label: "Resources", href: "/alumni/resources" },
            ]
        },
    ],
}

function getRoleDisplayName(role: string) {
    const roleMap: Record<string, string> = {
        'admin': 'Administrator',
        'hr_staff': 'HR Staff',
        'employee': 'Employee',
        'fellow': 'Fellow',
        'alumni': 'Alumni'
    }
    return roleMap[role] || role
}

function getProfilePath(role: string) {
    return `/${role === 'hr_staff' ? 'hr' : role}/profile`
}

function getSettingsPath(role: string) {
    return `/${role === 'hr_staff' ? 'hr' : role}/settings`
}

interface SubNavigationProps {
    items: NavItem[]
    activeItem: string
}

function SubNavigation({ items, activeItem }: SubNavigationProps) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    const checkScrollButtons = React.useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }, [])

    React.useEffect(() => {
        checkScrollButtons()
        const handleResize = () => checkScrollButtons()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [checkScrollButtons, items])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200
            const newScrollLeft = scrollContainerRef.current.scrollLeft +
                (direction === 'left' ? -scrollAmount : scrollAmount)
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })
        }
    }

    if (items.length === 0) return null

    return (
        <div className="border-t border-gray-200 bg-white">
            <div className="flex items-center">
                {canScrollLeft && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll('left')}
                        className="flex-shrink-0 h-12 px-2 rounded-none border-r"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    onScroll={checkScrollButtons}
                >
                    <div className="flex items-center min-w-max">
                        {items.map((item) => {
                            const isActive = activeItem === item.href || activeItem.startsWith(item.href + '/')
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                                        isActive
                                            ? "text-green-700 border-green-700 bg-green-50"
                                            : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {canScrollRight && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scroll('right')}
                        className="flex-shrink-0 h-12 px-2 rounded-none border-l"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

interface MobileNavItemProps {
    item: NavItem
    activeItem: string
    onLinkClick: () => void
}

function MobileNavItem({ item, activeItem, onLinkClick }: MobileNavItemProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isActive = activeItem === item.href || activeItem.startsWith(item.href + '/') ||
        (item.children && item.children.some(child =>
            activeItem === child.href || activeItem.startsWith(child.href + '/')
        ))

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-between h-12 px-4 rounded-lg transition-all duration-200",
                            isActive
                                ? "text-green-primary bg-green-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                        )} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                    {item.children?.map((child) => {
                        const ChildIcon = child.icon
                        const isChildActive = activeItem === child.href || activeItem.startsWith(child.href + '/')

                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                onClick={onLinkClick}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 ml-4 rounded-lg transition-colors duration-200",
                                    isChildActive
                                        ? "text-green-700 bg-green-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <ChildIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">{child.label}</span>
                            </Link>
                        )
                    })}
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        <Link
            href={item.href}
            onClick={onLinkClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                isActive
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
        </Link>
    )
}

export function TopNavigation() {
    const { user, signOut } = useAuth()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    if (!user) return null

    const items = navigationItems[user.role as keyof typeof navigationItems] || []
    const activeMainItem = items.find(item =>
        pathname === item.href ||
        pathname.startsWith(item.href + '/') ||
        (item.children && item.children.some(child =>
            pathname === child.href || pathname.startsWith(child.href + '/')
        ))
    )

    const closeMobileMenu = () => setMobileMenuOpen(false)

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            
            <div className="flex items-center justify-between h-16 px-4">
                
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-primary rounded-lg">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <div className="hidden lg:block">
                            <div className="font-semibold text-gray-900">GanzAfrica</div>
                            <div className="text-xs text-gray-500">
                                {getRoleDisplayName(user.role)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="md:hidden">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 p-0">
                            <div className="flex flex-col h-full">
                                
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-primary rounded-lg">
                                            <Leaf className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">GanzAfrica</div>
                                            <div className="text-xs text-gray-500">
                                                {getRoleDisplayName(user.role)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="flex-1 overflow-y-auto p-6">
                                    <nav className="space-y-2">
                                        {items.map((item) => (
                                            <MobileNavItem
                                                key={item.href}
                                                item={item}
                                                activeItem={pathname}
                                                onLinkClick={closeMobileMenu}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                
                <nav className="hidden md:flex items-center space-x-1">
                    {items.map((item) => {
                        const isActive = activeMainItem?.href === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "text-green-700 bg-green-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                
                <div className="flex items-center gap-2">
                    
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>

                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-8">
                                <Avatar className="w-6 h-6">
                                    {user.avatar_url ? (
                                        <AvatarImage src={user.avatar_url} alt={user.name} />
                                    ) : (
                                        <AvatarFallback className="bg-green-600 text-white text-xs">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <ChevronDown className="h-3 w-3 hidden sm:inline" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">{user.department}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={getProfilePath(user.role)}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={getSettingsPath(user.role)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                </div>
            </div>

            
            {activeMainItem?.children && (
                <SubNavigation
                    items={activeMainItem.children}
                    activeItem={pathname}
                />
            )}
        </header>
    )
}