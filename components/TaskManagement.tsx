"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectsApi, type Task, type CreateTaskDto, type UpdateTaskDto, type ProjectMember, type ApiError } from "@/lib/api/projects";
import { Plus, Edit2, Trash2, CheckCircle, Clock, PlayCircle, CheckSquare } from "lucide-react";

interface TaskManagementProps {
  projectId: string;
  userRole: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  members: ProjectMember[];
}

export default function TaskManagement({ projectId, userRole, members }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: "",
    description: "",
    status: "TODO",
    assignedToId: undefined,
  });

  const canManageTasks = userRole === 'OWNER' || userRole === 'CONTRIBUTOR';

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await projectsApi.getProjectTasks(projectId);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    try {
      const newTask = await projectsApi.createTask(projectId, formData);
      setTasks([...tasks, newTask]);
      setFormData({ title: "", description: "", status: "TODO", assignedToId: undefined });
      setShowCreateForm(false);
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const updateData: UpdateTaskDto = {
        title: formData.title,
        description: formData.description,
        status: formData.status as 'TODO' | 'DOING' | 'DONE',
        assignedToId: formData.assignedToId || undefined,
      };
      
      const updatedTask = await projectsApi.updateTask(editingTask.id, updateData);
      setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      setEditingTask(null);
      setFormData({ title: "", description: "", status: "TODO", assignedToId: undefined });
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await projectsApi.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: 'TODO' | 'DOING' | 'DONE') => {
    try {
      const updatedTask = await projectsApi.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      assignedToId: task.assignedToId || undefined,
    });
    setShowCreateForm(false);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setFormData({ title: "", description: "", status: "TODO", assignedToId: undefined });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'DOING': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'DONE': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'DOING': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignedUser = (assignedToId?: string) => {
    return members.find(member => member.id === assignedToId);
  };
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Tasks</CardTitle>
              <CardDescription className="text-gray-600">
                Manage project tasks and track progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Tasks</CardTitle>
              <CardDescription className="text-gray-600">
                Manage project tasks and track progress
              </CardDescription>
            </div>
          </div>          {canManageTasks && (
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingTask(null);
              }}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">        {/* Create/Edit Form */}
        {(showCreateForm || editingTask) && canManageTasks && (
          <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <h4 className="font-semibold text-green-900 flex items-center">
              {editingTask ? (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Task
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Task
                </>
              )}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="task-status">Status</Label>
                <select
                  id="task-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'TODO' | 'DOING' | 'DONE' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="TODO">To Do</option>
                  <option value="DOING">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <textarea
                id="task-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="task-assignee">Assign to</Label>
              <select
                id="task-assignee"
                value={formData.assignedToId || ""}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Unassigned</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>            <div className="flex space-x-2">
              <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={editingTask ? cancelEditing : () => setShowCreateForm(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const assignedUser = getAssignedUser(task.assignedToId);
              return (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      {assignedUser && (
                        <p className="text-xs text-gray-500">
                          Assigned to: {assignedUser.name}
                        </p>
                      )}
                    </div>
                    
                    {canManageTasks && (
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Quick status update */}
                        <div className="flex space-x-1">
                          {['TODO', 'DOING', 'DONE'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(task.id, status as 'TODO' | 'DOING' | 'DONE')}
                              className={`p-1 rounded text-xs ${
                                task.status === status 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={`Mark as ${status}`}
                            >
                              {status === 'TODO' && <Clock className="w-3 h-3" />}
                              {status === 'DOING' && <PlayCircle className="w-3 h-3" />}
                              {status === 'DONE' && <CheckCircle className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(task)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
              <CheckSquare className="h-8 w-8 text-green-600 mx-auto mt-2" />
            </div>
            <p className="text-gray-600 mb-2 font-medium">No tasks yet</p>
            {canManageTasks && (
              <p className="text-gray-500 text-sm">Create your first task!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
