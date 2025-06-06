"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectsApi, type ProjectAnalysisResponse, type ProjectSummaryResponse, type TagSuggestionResponse, type ApiError, type Tag } from "@/lib/api/projects";
import { Brain, Lightbulb, BarChart3, FileText, Sparkles, TrendingUp, AlertTriangle, Plus, Check } from "lucide-react";

interface AIFeaturesProps {
  projectId: string;
  onTagsUpdate?: (tags: Tag[]) => void;
}

export default function AIFeatures({ projectId, onTagsUpdate }: AIFeaturesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysisResponse | null>(null);
  const [summary, setSummary] = useState<ProjectSummaryResponse | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestionResponse | null>(null);
  const [suggestContent, setSuggestContent] = useState("");
  const [activeTab, setActiveTab] = useState<'analysis' | 'summary' | 'tags'>('analysis');
  const [addingTags, setAddingTags] = useState<Set<string>>(new Set());
  const [addedTags, setAddedTags] = useState<Set<string>>(new Set());

  
  const handleAnalyzeProject = async () => {
    try {
      setIsLoading(true);
      const analysisData = await projectsApi.analyzeProject(projectId);
      setAnalysis(analysisData);
      setActiveTab('analysis');
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      const summaryData = await projectsApi.getProjectSummary(projectId);
      setSummary(summaryData);
      setActiveTab('summary');
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestContent.trim()) return;

    try {
      setIsLoading(true);
      const suggestions = await projectsApi.suggestTags(suggestContent, projectId);
      setTagSuggestions(suggestions);
      setActiveTab('tags');
    } catch (err) {
      const apiError = err as ApiError;
      alert(Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddTagToProject = async (tagName: string) => {
    try {
      setAddingTags(prev => new Set(prev).add(tagName));
      
      // Create tag with a default color and add to project
      await projectsApi.createAndAddTagToProject(projectId, {
        name: tagName,
        color: '#3B82F6', // Default blue color
        description: `AI-suggested tag for project analysis`
      });
      
      setAddedTags(prev => new Set(prev).add(tagName));
      
      // Refresh project tags if callback is provided
      if (onTagsUpdate) {
        try {
          const updatedProjectTags = await projectsApi.getProjectTags(projectId);
          onTagsUpdate(updatedProjectTags);
        } catch (refreshError) {
          console.error('Failed to refresh tags:', refreshError);
        }
      }
      
      // Show success feedback
      alert(`Tag "${tagName}" has been added to your project!`);
      
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message;
      alert(`Failed to add tag: ${errorMessage}`);
    } finally {
      setAddingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(tagName);
        return newSet;
      });
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">AI Insights</CardTitle>
              <CardDescription className="text-gray-600">
                Get AI-powered analysis and suggestions for your project
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeProject}
              disabled={isLoading}
              className="border-gray-300 hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isLoading && activeTab === 'analysis' ? 'Analyzing...' : 'Analyze'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="border-gray-300 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isLoading && activeTab === 'summary' ? 'Generating...' : 'Summary'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">        {/* Tag Suggestions */}        <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <h4 className="font-semibold text-indigo-900 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Tag Suggestions
          </h4>
          <form onSubmit={handleSuggestTags} className="space-y-3">
            <div>
              <Label htmlFor="suggest-content">Describe your project</Label>
              <Input
                id="suggest-content"
                value={suggestContent}
                onChange={(e) => setSuggestContent(e.target.value)}
                placeholder="e.g., E-commerce platform with React, Node.js, and payment integration"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && activeTab === 'tags' ? 'Suggesting...' : 'Suggest Tags'}
            </Button>
          </form>            {tagSuggestions && (
            <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-indigo-900">Suggested Tags</h5>
                <span className="text-sm text-indigo-700 bg-indigo-200 px-2 py-1 rounded-full">
                  Confidence: {Math.round(tagSuggestions.confidence * 100)}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.suggestions.map((tag, index) => {
                  const isAdding = addingTags.has(tag);
                  const isAdded = addedTags.has(tag);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        isAdded 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      <span>{tag}</span>                      {!isAdded ? (
                        <button
                          onClick={() => handleAddTagToProject(tag)}
                          disabled={isAdding}
                          className={`ml-1 w-6 h-6 rounded-full flex items-center justify-center ${
                            isAdding
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors'
                          }`}
                          title={isAdding ? 'Adding...' : 'Add to project'}
                        >
                          {isAdding ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      ) : (
                        <div className="ml-1 w-6 h-6 rounded-full flex items-center justify-center bg-green-600 text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>              <p className="text-xs text-indigo-600 mt-2">
                Click the + button to add a suggested tag to your project
              </p>
            </div>
          )}
        </div>        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <h4 className="font-semibold text-green-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Project Analysis
            </h4>
            
            {/* Health Score */}
            <div className={`p-4 rounded-lg ${getHealthScoreBackground(analysis.healthScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Project Health Score</h5>
                  <p className="text-sm text-gray-600">Overall project health assessment</p>
                </div>
                <div className={`text-3xl font-bold ${getHealthScoreColor(analysis.healthScore)}`}>
                  {analysis.healthScore}/100
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h5 className="font-medium flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                  Risk Factors
                </h5>
                <ul className="space-y-1">
                  {analysis.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 mr-2 text-green-600" />
                  Recommendations
                </h5>
                <ul className="space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottlenecks */}
            {analysis.bottlenecks.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h5 className="font-medium flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2 text-yellow-600" />
                  Bottlenecks
                </h5>
                <ul className="space-y-1">
                  {analysis.bottlenecks.map((bottleneck, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {bottleneck}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predicted Completion */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium">Predicted Completion Date</h5>
              <p className="text-lg font-semibold text-blue-700">
                {new Date(analysis.predictedCompletionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}        {/* Summary Results */}
        {summary && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Project Summary
            </h4>
            
            <div className="p-4 bg-white/70 rounded-lg border border-blue-200">
              <h5 className="font-semibold mb-2 text-blue-900">Summary</h5>
              <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
            </div>

            {summary.keyInsights.length > 0 && (
              <div className="p-4 bg-white/70 rounded-lg border border-blue-200">
                <h5 className="font-semibold mb-2 text-blue-900">Key Insights</h5>
                <ul className="space-y-2">
                  {summary.keyInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}        {/* Empty State */}
        {!analysis && !summary && !tagSuggestions && (
          <div className="text-center py-8">
            <div className="p-4 bg-indigo-100 rounded-full w-16 h-16 mx-auto mb-4">
              <Brain className="h-8 w-8 text-indigo-600 mx-auto mt-2" />
            </div>
            <p className="text-gray-600 mb-2 font-medium">AI Insights</p>
            <p className="text-gray-500 text-sm">Use the buttons above to get AI insights about your project</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
