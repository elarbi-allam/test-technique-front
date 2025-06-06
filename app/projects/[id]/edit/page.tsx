"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/ui/app-layout";
import { projectsApi, type Project, type UpdateProjectDto, type ApiError } from "@/lib/api/projects";
import { tokenManager } from "@/lib/auth";
import { ArrowLeft, Settings, Save, Loader2, AlertCircle, FolderEdit, Shield, Info, CheckCircle } from "lucide-react";

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters long")
    .max(100, "Project name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export default function EditProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

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

    if (projectId) {
      loadProject();
    }
  }, [isMounted, router, projectId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  });

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectData = await projectsApi.getProject(projectId);
      
      // Check if user is owner
      if (projectData.userRole !== 'OWNER') {
        setError("You don't have permission to edit this project");
        return;
      }
      
      setProject(projectData);
      setValue("name", projectData.name);
      setValue("description", projectData.description);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message as string || "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateProjectFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      const updateData: UpdateProjectDto = {
        name: data.name,
        description: data.description,
      };
      
      const updatedProject = await projectsApi.updateProject(projectId, updateData);
      router.push(`/projects/${updatedProject.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      if (Array.isArray(apiError.message)) {
        setError(apiError.message.join(", "));
      } else {
        setError(apiError.message || "An error occurred while updating the project");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading project details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600 mx-auto mt-2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6 max-w-md">{error}</p>
            <Link href="/projects">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <FolderEdit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Project</h1>
                <p className="text-emerald-100 mt-1">Update your project details and keep your team informed</p>
              </div>
            </div>
            <Link href={`/projects/${projectId}`}>
              <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Settings className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Project Details</CardTitle>
                    <CardDescription className="text-gray-600">
                      Update your project information. Changes will be visible to all team members.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Project Name *
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter a descriptive project name"
                        {...register("name")}
                        disabled={isSaving}
                        className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <FolderEdit className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Choose a clear, descriptive name that reflects your project's purpose
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Project Description *
                    </Label>
                    <textarea
                      id="description"
                      rows={5}
                      placeholder="Describe your project goals, scope, and key objectives. This helps team members understand the project context."
                      {...register("description")}
                      disabled={isSaving}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.description.message}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Provide comprehensive details to help team members understand the project
                    </p>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Link href={`/projects/${projectId}`} className="flex-1">
                      <Button type="button" variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Guidelines */}
          <div className="space-y-6">
            {/* Edit Guidelines */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Edit Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="font-semibold text-blue-900 mb-1">Project Name</div>
                    <div className="text-blue-700">Changes will be visible to all team members immediately. Choose wisely!</div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <div className="font-semibold text-purple-900 mb-1">Description</div>
                    <div className="text-purple-700">Update to reflect changes in project scope, objectives, or key requirements.</div>
                  </div>
                  
                  <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                    <div className="font-semibold text-emerald-900 mb-1">Permissions</div>
                    <div className="text-emerald-700">Only project owners can edit details. Other settings are available on the main project page.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            {project && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Current Project</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Name:</span>
                      <p className="text-gray-600 mt-1">{project.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Created:</span>
                      <p className="text-gray-600 mt-1">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Members:</span>
                      <p className="text-gray-600 mt-1">{project.memberCount} team members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Pro Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Keep project names concise but descriptive</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Update descriptions when project scope changes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Notify team members of major changes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
