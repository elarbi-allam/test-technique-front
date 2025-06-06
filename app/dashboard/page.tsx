"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/ui/app-layout";
import { tokenManager, type User } from "@/lib/auth";
import { projectsApi, type Project } from "@/lib/api/projects";
import { Plus, FolderOpen, Users, CheckSquare, TrendingUp, Activity, User as UserIcon } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check if user is authenticated
    const isAuthenticated = tokenManager.isAuthenticated();
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Get user data from storage
    const userData = tokenManager.getUser();
    setUser(userData);
    
    // Load projects
    loadProjects();
  }, [isMounted, router]);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getPaginatedProjects({ limit: 5 });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-900">{projects.length}</p>
                  <p className="text-sm text-blue-700 mt-1">Active projects</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Tasks</p>
                  <p className="text-3xl font-bold text-green-900">0</p>
                  <p className="text-sm text-green-700 mt-1">Pending completion</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-2xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Team Members</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {projects.reduce((total, project) => total + project.memberCount, 0)}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">Across all projects</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-2xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Productivity</p>
                  <p className="text-3xl font-bold text-orange-900">85%</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last week
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Recent Projects</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your latest projects and their status
                    </CardDescription>
                  </div>
                </div>
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 4).map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all duration-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {project.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                          </span>
                          <span>
                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.userRole === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                          project.userRole === 'CONTRIBUTOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.userRole}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                    <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mt-2" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">No projects yet</p>
                  <p className="text-gray-500 text-sm mb-6">Create your first project to get started</p>
                  <Link href="/projects/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first project
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-600">
                      Get started with common tasks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/projects/new" className="block">
                  <Button className="w-full justify-start h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg" size="lg">
                    <Plus className="h-5 w-5 mr-3" />
                    Create New Project
                  </Button>
                </Link>
                <Link href="/projects" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-gray-300 hover:bg-gray-50" size="lg">
                    <FolderOpen className="h-5 w-5 mr-3" />
                    Browse Projects
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300 opacity-50" size="lg" disabled>
                  <Users className="h-5 w-5 mr-3" />
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-2xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Profile Summary</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your account information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-semibold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since</span>
                      <span className="text-gray-900 font-medium">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Recently"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Projects Owned</span>
                      <span className="text-gray-900 font-medium">
                        {projects.filter(p => p.userRole === 'OWNER').length}
                      </span>
                    </div>
                  </div>                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects/new">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
