"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/ui/app-layout";
import { projectsApi, type Project, type ProjectMember, type Tag, type InviteUserDto, type ApiError } from "@/lib/api/projects";
import { tokenManager } from "@/lib/auth";
import { ArrowLeft, Users, Calendar, Tag as TagIcon, Mail, Settings, Trash2, UserPlus, FolderOpen, Activity, TrendingUp, Clock, Star, Shield } from "lucide-react";
import TaskManagement from "@/components/TaskManagement";
import TagManagement from "@/components/TagManagement";
import AIFeatures from "@/components/AIFeatures";

export default function ProjectDetailsPage() {  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'CONTRIBUTOR' | 'VIEWER'>('CONTRIBUTOR');
  const [isInviting, setIsInviting] = useState(false);
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
      loadProjectData();
    }
  }, [isMounted, router, projectId]);  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load project data first
      const projectData = await projectsApi.getProject(projectId);
      setProject(projectData);
        // Then load members and tags with individual error handling
      try {
        const membersData = await projectsApi.getProjectMembers(projectId);
        if (Array.isArray(membersData)) {
          // Deduplicate members by ID to avoid React key conflicts
          const uniqueMembers = membersData.filter((member, index, array) => 
            array.findIndex(m => m.id === member.id) === index
          );
          setMembers(uniqueMembers);
        } else {
          setMembers([]);
        }
      } catch (membersError) {
        console.error('Failed to load members:', membersError);
        setMembers([]); // Fallback to empty array
      }
        try {
        const tagsData = await projectsApi.getProjectTags(projectId);
        setTags(Array.isArray(tagsData) ? tagsData : []);
      } catch (tagsError) {
        console.error('Failed to load tags:', tagsError);
        setTags([]); // Fallback to empty array
      }

      try {
        const tasksData = await projectsApi.getProjectTasks(projectId);
        setTaskCount(Array.isArray(tasksData) ? tasksData.length : 0);
      } catch (tasksError) {
        console.error('Failed to load tasks:', tasksError);
        setTaskCount(0);
      }
      
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message as string || "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      router.push("/projects");
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || "Failed to delete project");
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const inviteData: InviteUserDto = {
        email: inviteEmail.trim(),
        role: inviteRole,
      };
      
      const response = await projectsApi.inviteUser(projectId, inviteData);
      setMembers([...members, response.member]);
      setInviteEmail("");
      setShowInviteForm(false);
      alert("User invited successfully!");
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || "Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };  const handleTagsUpdate = (updatedTags: Tag[]) => {
    setTags(updatedTags);
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

  const canManageProject = project?.userRole === 'OWNER';
  const canInvite = project?.userRole === 'OWNER';

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

  if (error || !project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-red-600 mx-auto mt-2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md">{error || "The project you're looking for doesn't exist or you don't have access to it."}</p>
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
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30`}>
                    {project.userRole}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Created {formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{project.memberCount} members</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/projects">
                <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              {canManageProject && (
                <>
                  <Link href={`/projects/${projectId}/edit`}>
                    <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteProject}
                    className="bg-red-500/80 hover:bg-red-600 border-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Team Members</p>
                  <p className="text-2xl font-bold text-blue-900">{project.memberCount}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Project Tags</p>
                  <p className="text-2xl font-bold text-purple-900">{tags.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TagIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-green-900">{taskCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Your Role</p>
                  <p className="text-lg font-bold text-amber-900">{project.userRole}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Project Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>

            {/* Project Tags */}
            <TagManagement 
              projectId={projectId}
              userRole={project.userRole}
              projectTags={tags}
              onTagsUpdate={handleTagsUpdate}
            />

            {/* Tasks Section */}
            <TaskManagement 
              projectId={projectId}
              userRole={project.userRole}
              members={members}
            />

            {/* AI Features */}
            <AIFeatures projectId={projectId} onTagsUpdate={handleTagsUpdate} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">Team Members</CardTitle>
                  </div>
                  {canInvite && (
                    <Button
                      size="sm"
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invite Form */}
                {showInviteForm && (
                  <Card className="border border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <form onSubmit={handleInviteUser} className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                          <div className="relative mt-1">
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="Enter email address"
                              className="pl-10"
                              required
                            />
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="invite-role" className="text-sm font-semibold text-gray-700">Role</Label>
                          <select
                            id="invite-role"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'CONTRIBUTOR' | 'VIEWER')}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="CONTRIBUTOR">Contributor</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm" disabled={isInviting} className="bg-green-600 hover:bg-green-700">
                            {isInviting ? "Inviting..." : "Send Invite"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInviteForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Members List */}
                <div className="space-y-3">
                  {Array.isArray(members) && members.length > 0 ? (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium">No members found</p>
                      <p className="text-xs">Invite team members to collaborate</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Activity Timeline */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Project Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Project created</span>
                    <span className="text-gray-400 ml-auto">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{tags.length} tags configured</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">{project.memberCount} team members</span>
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
