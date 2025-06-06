"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectsApi, type Tag, type CreateTagDto, type ApiError } from "@/lib/api/projects";
import { Plus, X, Palette, Tag as TagIcon } from "lucide-react";

interface TagManagementProps {
  projectId: string;
  userRole: 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';
  projectTags: Tag[];
  onTagsUpdate: (tags: Tag[]) => void;
}

export default function TagManagement({ projectId, userRole, projectTags, onTagsUpdate }: TagManagementProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddTags, setShowAddTags] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateTagDto>({
    name: "",
    color: "#6366f1",
    description: "",
  });

  const canManageTags = userRole === 'OWNER' || userRole === 'CONTRIBUTOR';

  useEffect(() => {
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      setIsLoading(true);
      const tagsData = await projectsApi.getAllTags();
      setAllTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAllTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const newTag = await projectsApi.createTag(formData);
      setAllTags([...allTags, newTag]);
      setFormData({ name: "", color: "#6366f1", description: "" });
      setShowCreateForm(false);
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const handleAddTagsToProject = async () => {
    if (selectedTagIds.length === 0) return;

    try {
      await projectsApi.addTagsToProject(projectId, selectedTagIds);
      // Refresh project tags
      const updatedProjectTags = await projectsApi.getProjectTags(projectId);
      onTagsUpdate(updatedProjectTags);
      setSelectedTagIds([]);
      setShowAddTags(false);
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const handleRemoveTagFromProject = async (tagId: string) => {
    if (!window.confirm('Remove this tag from the project?')) return;

    try {
      await projectsApi.removeTagFromProject(projectId, tagId);
      const updatedTags = projectTags.filter(tag => tag.id !== tagId);
      onTagsUpdate(updatedTags);
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    }
  };

  const getAvailableTagsToAdd = () => {
    const projectTagIds = projectTags.map(tag => tag.id);
    return allTags.filter(tag => !projectTagIds.includes(tag.id));
  };

  const predefinedColors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", 
    "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6"
  ];
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Tags</CardTitle>
              <CardDescription className="text-gray-600">
                Organize and categorize your project
              </CardDescription>
            </div>
          </div>          {canManageTags && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTags(!showAddTags)}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Existing
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">        {/* Create Tag Form */}
        {showCreateForm && canManageTags && (
          <form onSubmit={handleCreateTag} className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <h4 className="font-semibold text-purple-900 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create New Tag
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tag-name">Name</Label>
                <Input
                  id="tag-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tag name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tag-color">Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="tag-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="tag-description">Description (optional)</Label>
              <Input
                id="tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tag description"
              />
            </div>            <div className="flex space-x-2">
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                Create Tag
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}        {/* Add Existing Tags Form */}
        {showAddTags && canManageTags && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Existing Tags
            </h4>
            
            {isLoading ? (
              <p className="text-sm text-gray-600">Loading tags...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {getAvailableTagsToAdd().map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTagIds([...selectedTagIds, tag.id]);
                          } else {
                            setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: tag.color + '20', 
                          color: tag.color 
                        }}
                      >
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
                
                {getAvailableTagsToAdd().length === 0 && (
                  <p className="text-sm text-gray-600">No additional tags available</p>
                )}
                  <div className="flex space-x-2">
                  <Button
                    onClick={handleAddTagsToProject}
                    size="sm"
                    disabled={selectedTagIds.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Selected ({selectedTagIds.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddTags(false);
                      setSelectedTagIds([]);
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Project Tags Display */}
        {projectTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {projectTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium group"
                style={{ 
                  backgroundColor: tag.color + '20', 
                  color: tag.color 
                }}
              >
                <span>{tag.name}</span>
                {canManageTags && (
                  <button
                    onClick={() => handleRemoveTagFromProject(tag.id)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded-full p-1"
                    title="Remove tag from project"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4">
              <TagIcon className="h-8 w-8 text-purple-600 mx-auto mt-2" />
            </div>
            <p className="text-gray-600 mb-2 font-medium">No tags assigned</p>
            {canManageTags && (
              <p className="text-gray-500 text-sm">Add some tags to organize this project!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
