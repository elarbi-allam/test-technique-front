"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/ui/app-layout";
import { projectsApi, type CreateProjectDto, type ApiError } from "@/lib/api/projects";
import { tokenManager } from "@/lib/auth";
import { ArrowLeft, FolderPlus, Loader2, CheckCircle, Lightbulb, Sparkles } from "lucide-react";

const createProjectSchema = z.object({
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

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function NewProjectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, [isMounted, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const project = await projectsApi.createProject(data);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      if (Array.isArray(apiError.message)) {
        setError(apiError.message.join(", "));
      } else {
        setError(apiError.message || "An error occurred while creating the project");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <FolderPlus className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create New Project</h1>
                <p className="text-indigo-100 mt-1">Start your next great project and bring your ideas to life</p>
              </div>
            </div>
            <Link href="/projects">
              <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
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
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Project Details</CardTitle>
                    <CardDescription className="text-gray-600">
                      Set up your project with a clear name and compelling description
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                      <div className="w-5 h-5 text-red-500">⚠</div>
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
                        placeholder="e.g., E-commerce Platform, Mobile App, Web Dashboard"
                        {...register("name")}
                        disabled={isLoading}
                        className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <FolderPlus className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Choose a descriptive name that clearly represents your project
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Project Description *
                    </Label>
                    <textarea
                      id="description"
                      rows={5}
                      placeholder="Describe your project goals, target audience, key features, and expected outcomes. This helps team members understand the project's purpose and scope."
                      {...register("description")}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠</span>
                        <span>{errors.description.message}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      A detailed description helps team members understand the project context
                    </p>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                    <Link href="/projects" className="flex-1">
                      <Button type="button" variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Guidelines and Tips */}
          <div className="space-y-6">
            {/* Guidelines Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Project Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="font-semibold text-blue-900 mb-1">Project Name</div>
                    <div className="text-blue-700">Choose a clear, descriptive name that will be visible to all team members and stakeholders.</div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <div className="font-semibold text-purple-900 mb-1">Description</div>
                    <div className="text-purple-700">Explain the project's purpose, goals, and scope to help team members understand the context.</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="font-semibold text-green-900 mb-1">Ownership</div>
                    <div className="text-green-700">As the creator, you'll become the project owner with full management permissions.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Pro Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use action-oriented names like "Build Mobile App" rather than "Mobile App"</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Include target completion timeline in your description</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mention key technologies or tools you plan to use</span>
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
