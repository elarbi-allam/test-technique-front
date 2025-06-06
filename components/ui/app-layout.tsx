"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenManager, type User } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Bell } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isAuthenticated = tokenManager.isAuthenticated();
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const userData = tokenManager.getUser();
    setUser(userData);
    setIsLoading(false);
  }, [isMounted, router]);

  const handleLogout = () => {
    tokenManager.logout();
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Skip auth redirect for auth pages
  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-sm text-gray-600">
                {getPageDescription(pathname)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hover:bg-indigo-50">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  switch (true) {
    case pathname === '/dashboard':
      return 'Dashboard';
    case pathname === '/projects':
      return 'Projects';
    case pathname === '/projects/new':
      return 'Create New Project';
    case pathname.startsWith('/projects/') && pathname.endsWith('/edit'):
      return 'Edit Project';
    case pathname.startsWith('/projects/'):
      return 'Project Details';
    case pathname === '/profile':
      return 'Profile';
    case pathname === '/settings':
      return 'Settings';
    default:
      return 'ProjectHub';
  }
}

function getPageDescription(pathname: string): string {
  switch (true) {
    case pathname === '/dashboard':
      return 'Overview of your projects and recent activity';
    case pathname === '/projects':
      return 'Manage and view all your projects';
    case pathname === '/projects/new':
      return 'Start a new project';
    case pathname.startsWith('/projects/') && pathname.endsWith('/edit'):
      return 'Modify project details and settings';
    case pathname.startsWith('/projects/'):
      return 'View project details and manage tasks';
    case pathname === '/profile':
      return 'Manage your account settings';
    case pathname === '/settings':
      return 'Application preferences and configuration';
    default:
      return 'Welcome to your project management workspace';
  }
}
