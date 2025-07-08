// components/admin/EcoNewsAdmin.js
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Save, X } from "lucide-react";

export default function EcoNewsAdmin() {
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "oceans", label: "Oceans & Marine Life" },
    { value: "wildlife", label: "Wildlife & Biodiversity" },
    { value: "climate", label: "Climate Change" },
    { value: "conservation", label: "Conservation Efforts" },
    { value: "policy", label: "Environmental Policy" },
    { value: "innovation", label: "Green Innovation" },
    { value: "education", label: "Environmental Education" },
  ];

  const postTypes = [
    { value: "news", label: "News Article" },
    { value: "blog", label: "Editorial/Blog Post" },
    { value: "student_submission", label: "Student Submission" },
  ];

  // Initialize form data
  const getEmptyPost = () => ({
    title: "",
    summary: "",
    content: "",
    type: "news",
    category: "oceans",
    author_name: "",
    source_name: "",
    source_url: "",
    region_code: "",
    featured: false,
    tags: [],
    status: "published",
  });

  const [formData, setFormData] = useState(getEmptyPost());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/eco-news");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPost
        ? `/api/eco-news/${editingPost.id}`
        : "/api/eco-news";
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPosts();
        resetForm();
        alert(
          editingPost
            ? "Post updated successfully!"
            : "Post created successfully!"
        );
      } else {
        alert("Error saving post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Error saving post");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/eco-news/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPosts();
        alert("Post deleted successfully!");
      } else {
        alert("Error deleting post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post");
    }
  };

  const resetForm = () => {
    setFormData(getEmptyPost());
    setIsCreating(false);
    setEditingPost(null);
  };

  const startEdit = (post) => {
    setFormData(post);
    setEditingPost(post);
    setIsCreating(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading eco-news management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Eco-News Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage environmental news, blog posts, and student submissions
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Post
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingPost ? (
                <Edit className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {editingPost ? "Edit Post" : "Create New Post"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {postTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary *
                </label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief summary of the post"
                  required
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Content {formData.type === "blog" && "*"}
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={8}
                  placeholder="Full article content (especially important for blog posts)"
                  required={formData.type === "blog"}
                />
              </div>

              {/* Category, Author/Source, Region */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.type === "news" ? "Source Name" : "Author Name"}
                  </label>
                  <Input
                    value={
                      formData.type === "news"
                        ? formData.source_name
                        : formData.author_name
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [formData.type === "news"
                          ? "source_name"
                          : "author_name"]: e.target.value,
                      })
                    }
                    placeholder={
                      formData.type === "news"
                        ? "e.g., BBC News"
                        : "e.g., Dr. Jane Smith"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Region Code
                  </label>
                  <Input
                    value={formData.region_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region_code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., BR, US, AU"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Source URL
                </label>
                <Input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) =>
                    setFormData({ ...formData, source_url: e.target.value })
                  }
                  placeholder="https://example.com/article"
                />
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Featured Post</span>
                </label>
                <span className="text-xs text-gray-500">
                  Featured posts appear prominently on the news page
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingPost ? "Update Post" : "Create Post"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Posts ({posts.length})</h2>

        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Post badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.type}</Badge>
                    <Badge variant="outline">{post.category}</Badge>
                    {post.featured && (
                      <Badge className="bg-yellow-500 text-white">
                        Featured
                      </Badge>
                    )}
                    {post.region_code && (
                      <Badge variant="outline">{post.region_code}</Badge>
                    )}
                  </div>

                  {/* Post content */}
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                    {post.summary.length > 200
                      ? `${post.summary.substring(0, 200)}...`
                      : post.summary}
                  </p>

                  {/* Post metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(post.published_date)}</span>
                    {post.author_name && <span>By: {post.author_name}</span>}
                    {post.source_name && (
                      <span>Source: {post.source_name}</span>
                    )}
                    <span>Views: {post.view_count || 0}</span>
                    {post.read_time_minutes && (
                      <span>{post.read_time_minutes} min read</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 ml-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`/eco-news/${post.slug || post.id}`, "_blank")
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(post)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state */}
        {posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your first eco-news post to get started!
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
