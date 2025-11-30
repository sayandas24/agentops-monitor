"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projectsAPI } from "@/libs/api";
import { Project } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const data = await projectsAPI.list();
        console.log(data, "data");
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Handle project creation
  async function createProject() {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newProject = await projectsAPI.create(
        name.trim(),
        description.trim()
      );
      setProjects((prev) => [newProject, ...prev]);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  // Handle selecting project (store in localStorage and navigate)
  function selectProject(project: Project) {
    localStorage.setItem("currentProjectId", project.id);
    localStorage.setItem("currentProjectName", project.name);
    localStorage.setItem("currentProjectApiKey", project.api_key);
    router.push("/dashboard");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Projects</h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-600">{error}</p>
      )}

      {/* Create Project Form */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Create New Project</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              type="text"
              placeholder="My Agent Monitoring Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="project-desc">Description (optional)</Label>
            <Input
              id="project-desc"
              type="text"
              placeholder="Describe your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={createProject} disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </Card>

      {/* Project List */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer p-4 hover:shadow-md"
            onClick={() => selectProject(project)}
          >
            <h3 className="text-lg font-semibold">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <p className="mt-1 text-xs font-mono text-gray-400 break-all">
              API Key: {project.api_key}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
