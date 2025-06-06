"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/ui/app-layout";
import { projectsApi, type Project, type PaginationQueryDto, type ApiError } from "@/lib/api/projects";
import { tokenManager } from "@/lib/auth";
import { Plus, Search, Users, Calendar, Tag, FolderOpen, Filter, Grid, List } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check authentication
    if (!tokenManager.isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    loadProjects();
  }, [isMounted, router]);

  const loadProjects = async (params: PaginationQueryDto = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectsApi.getPaginatedProjects({
        ...params,
        search: searchTerm || undefined,
      });
      setProjects(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message as string || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects({ search: searchTerm });
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || "Failed to delete project");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }  if (isLoading && projects.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </AppLayout>
    );
  }  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Modern Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search projects by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-12 h-12 border-0 bg-gradient-to-r from-white to-indigo-50/50 shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={(e) => handleSearch(e)} 
                  className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Link href="/projects/new">
                  <Button size="lg" className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300 hover:scale-105">
                    <Plus className="h-5 w-5 mr-2" />
                    New Project
                  </Button>
                </Link>
                <div className="flex items-center bg-white border border-indigo-200 rounded-lg p-1 shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-9 w-9 p-0 ${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'hover:bg-indigo-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-9 w-9 p-0 ${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'hover:bg-indigo-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>        {/* Enhanced Error Message */}
        {error && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-700 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}        {/* Projects Content */}
        {projects.length === 0 && !isLoading ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-indigo-100 rounded-full w-20 h-20 mx-auto mb-6">
                <FolderOpen className="w-12 h-12 text-indigo-600 mx-auto mt-2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                {searchTerm 
                  ? "Try adjusting your search criteria or browse all projects" 
                  : "Get started by creating your first project and invite your team to collaborate"
                }
              </p>
              <div className="flex space-x-3">
                {searchTerm && (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    loadProjects();
                  }} className="border-gray-300 hover:bg-gray-50">
                    Clear Search
                  </Button>
                )}
                <Link href="/projects/new">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                        {project.description}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${getRoleColor(project.userRole)}`}>
                      {project.userRole}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-blue-500" />
                      {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-green-500" />
                      {formatDate(project.createdAt)}
                    </div>
                  </div>                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 rounded-full text-xs truncate"
                            style={{ 
                              backgroundColor: tag.color + '20', 
                              color: tag.color 
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200">
                        View Project
                      </Button>
                    </Link>
                    {project.userRole === 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>        ) : (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <div key={project.id} className="p-6 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {project.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(project.userRole)}`}>
                            {project.userRole}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-1">
                          {project.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-blue-500" />
                            {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-green-500" />
                            Created {formatDate(project.createdAt)}
                          </div>
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4 text-purple-500" />
                              <span>{project.tags.length} tag{project.tags.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200">View Project</Button>
                        </Link>
                        {project.userRole === 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>        )}
      </div>
    </AppLayout>
  );
}
