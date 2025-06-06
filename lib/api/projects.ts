// Projects API client - using Next.js API routes to avoid CORS
import { tokenManager } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// Types based on API documentation
export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface InviteUserDto {
  email: string;
  role: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userRole: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  memberCount: number;
  tags: Tag[];
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  joinedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'DOING' | 'DONE';
  projectId: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
  description?: string;
}

export interface AddTagsToProjectDto {
  tagIds: string[];
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: 'TODO' | 'DOING' | 'DONE';
  assignedToId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'TODO' | 'DOING' | 'DONE';
  assignedToId?: string;
}

export interface SuggestTagsDto {
  content: string;
  projectId?: string;
}

export interface TagSuggestionResponse {
  suggestions: string[];
  confidence: number;
}

export interface ProjectAnalysisResponse {
  healthScore: number;
  riskFactors: string[];
  recommendations: string[];
  predictedCompletionDate: string;
  bottlenecks: string[];
}

export interface ProjectSummaryResponse {
  summary: string;
  keyInsights: string[];
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sort?: 'name' | 'createdAt' | 'memberCount';
  order?: 'asc' | 'desc';
  search?: string;
  tags?: string;
}

export interface PaginationMetaDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

class ProjectsApi {  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    // Handle empty responses (like 204 No Content)
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');
    
    let data;
    if (response.status === 204 || !hasJsonContent) {
      // For 204 No Content or non-JSON responses, return undefined/null
      data = undefined;
    } else {
      // Check if response has content before parsing JSON
      const text = await response.text();
      data = text ? JSON.parse(text) : undefined;
    }

    if (!response.ok) {
      throw data as ApiError;
    }

    return data;
  }
  // Create new project
  async createProject(projectData: CreateProjectDto): Promise<Project> {
    return this.makeRequest<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Get all projects for authenticated user
  async getProjects(): Promise<Project[]> {
    return this.makeRequest<Project[]>('/api/projects');
  }

  // Get paginated projects with filtering and sorting
  async getPaginatedProjects(params: PaginationQueryDto = {}): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/projects/paginated${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<PaginatedResponse<Project>>(endpoint);
  }
  // Get specific project details
  async getProject(projectId: string): Promise<Project> {
    return this.makeRequest<Project>(`/api/projects/${projectId}`);
  }

  // Update project details (OWNER only)
  async updateProject(projectId: string, updateData: UpdateProjectDto): Promise<Project> {
    return this.makeRequest<Project>(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Delete project permanently (OWNER only)
  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
  // Invite user to project (OWNER only)
  async inviteUser(projectId: string, inviteData: InviteUserDto): Promise<{ message: string; member: ProjectMember }> {
    return this.makeRequest<{ message: string; member: ProjectMember }>(`/api/projects/${projectId}/invite`, {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  // Get project members list
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.makeRequest<ProjectMember[]>(`/api/projects/${projectId}/members`);
  }

  // Get all tags associated with a project
  async getProjectTags(projectId: string): Promise<Tag[]> {
    return this.makeRequest<Tag[]>(`/api/projects/${projectId}/tags`);
  }

  // Add tags to project (OWNER, CONTRIBUTOR only)
  async addTagsToProject(projectId: string, tagIds: string[]): Promise<Project> {
    return this.makeRequest<Project>(`/api/projects/${projectId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagIds }),
    });
  }
  // Remove tag from project (OWNER, CONTRIBUTOR only)
  async removeTagFromProject(projectId: string, tagId: string): Promise<void> {
    return this.makeRequest<void>(`/api/projects/${projectId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  // ===== TAG MANAGEMENT =====
  
  // Create a new tag
  async createTag(tagData: CreateTagDto): Promise<Tag> {
    return this.makeRequest<Tag>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  // Get all available tags
  async getAllTags(): Promise<Tag[]> {
    return this.makeRequest<Tag[]>('/api/tags');
  }

  // Get specific tag by ID
  async getTag(tagId: string): Promise<Tag> {
    return this.makeRequest<Tag>(`/api/tags/${tagId}`);
  }

  // Update tag (creator only)
  async updateTag(tagId: string, updateData: UpdateTagDto): Promise<Tag> {
    return this.makeRequest<Tag>(`/api/tags/${tagId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Delete tag (creator only)
  async deleteTag(tagId: string): Promise<void> {
    return this.makeRequest<void>(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  // ===== TASK MANAGEMENT =====
  
  // Create a new task in project
  async createTask(projectId: string, taskData: CreateTaskDto): Promise<Task> {
    return this.makeRequest<Task>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Get all tasks for a project
  async getProjectTasks(projectId: string): Promise<Task[]> {
    return this.makeRequest<Task[]>(`/api/projects/${projectId}/tasks`);
  }

  // Update task
  async updateTask(taskId: string, updateData: UpdateTaskDto): Promise<Task> {
    return this.makeRequest<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Delete task
  async deleteTask(taskId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // ===== AI FEATURES =====
  
  // Get AI-powered tag suggestions
  async suggestTags(content: string, projectId?: string): Promise<TagSuggestionResponse> {
    return this.makeRequest<TagSuggestionResponse>('/api/ai/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({ content, projectId }),
    });
  }

  // Get AI-powered project analysis
  async analyzeProject(projectId: string): Promise<ProjectAnalysisResponse> {
    return this.makeRequest<ProjectAnalysisResponse>(`/api/ai/analyze-project/${projectId}`);
  }

  // Generate AI-powered project summary
  async getProjectSummary(projectId: string): Promise<ProjectSummaryResponse> {
    return this.makeRequest<ProjectSummaryResponse>(`/api/ai/project-summary/${projectId}`);
  }

  // ===== HELPER METHODS =====
  
  // Create a tag and add it to project in one call
  async createAndAddTagToProject(projectId: string, tagData: CreateTagDto): Promise<{ tag: Tag; project: Project }> {
    // First create the tag
    const tag = await this.createTag(tagData);
    
    // Then add it to the project
    const project = await this.addTagsToProject(projectId, [tag.id]);
    
    return { tag, project };
  }
}

export const projectsApi = new ProjectsApi();
