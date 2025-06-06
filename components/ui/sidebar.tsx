"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { tokenManager, type User } from "@/lib/auth";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Plus, 
  Settings, 
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Building
} from "lucide-react";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

function SidebarItem({ href, icon, label, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-11 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200",
          isCollapsed && "justify-center px-2",
          isActive && "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700"
        )}
      >
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && <span className="truncate font-medium">{label}</span>}
      </Button>
    </Link>
  );
}

function Sidebar({ className, children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const userData = tokenManager.getUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    tokenManager.logout();
    router.push("/auth/login");
  };

  const navigation = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/projects",
      icon: <FolderOpen className="h-5 w-5" />,
      label: "All Projects",
    },
    {
      href: "/projects/new",
      icon: <Plus className="h-5 w-5" />,
      label: "New Project",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 border-r border-slate-700 transition-all duration-300 shadow-2xl",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                ProjectHub
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              // More precise matching logic to avoid multiple highlights
              let isActive = false;
              if (item.href === "/dashboard") {
                isActive = pathname === "/dashboard";
              } else if (item.href === "/projects/new") {
                isActive = pathname === "/projects/new";
              } else if (item.href === "/projects") {
                isActive = pathname === "/projects" || (pathname.startsWith("/projects/") && !pathname.startsWith("/projects/new"));
              } else {
                isActive = pathname === item.href;
              }

              return (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700 bg-gradient-to-r from-slate-800/50 to-gray-800/50 backdrop-blur-sm">
          {/* User Info */}
          {!isCollapsed && user && (
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-semibold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="p-4 space-y-1">            
            <SidebarItem
              href="/profile"
              icon={<UserIcon className="h-4 w-4" />}
              label="Profile"
              isActive={pathname === "/profile"}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              isActive={pathname === "/settings"}
              isCollapsed={isCollapsed}
            />
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 text-gray-300 hover:text-white hover:bg-red-600/20 transition-all duration-200",
                isCollapsed && "justify-center px-2"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate font-medium">Logout</span>}
            </Button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export { Sidebar, SidebarItem };
