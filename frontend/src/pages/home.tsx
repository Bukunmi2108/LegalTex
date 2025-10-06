"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "../services/api";
import { Plus, FileText, FolderOpen, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAppStore, type Project } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";

const defaultContent = `\\documentclass{article}
\\begin{document}
New LegalTex document
\\end{document}`;

export default function Home() {
  const navigate = useNavigate();
  const projects = useAppStore((state) => state.projects);
  const isLoading = useAppStore((state) => state.projectsLoading);
  const setProjects = useAppStore((state) => state.setProjects);
  const setProjectsLoading = useAppStore((state) => state.setProjectsLoading);
  const addProject = useAppStore((state) => state.addProject);
  const setActiveProject = useAppStore((state) => state.setActiveProject);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error: any) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setProjectsLoading(false);
    }
  }, [setProjects, setProjectsLoading]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleNewDocument = async () => {
    const newDocTitle = `Untitled Document ${projects.length + 1}`;
    try {
      const res = await api.post("/projects", {
        title: newDocTitle,
        content: defaultContent,
      });
      const newProject = res.data;
      addProject(newProject);
      setActiveProject(newProject);
      toast.success("New document created!");
      navigate("/editor");
    } catch (error) {
      toast.error("Failed to create new document.");
      console.error(error);
    }
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    navigate("/editor");
  };

  return (
    <div className="dark bg-background min-h-screen text-foreground flex flex-col">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            LegalTex
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            A modern LaTeX workspace for legal professionals.
          </p>
          <Button
            size="sm"
            onClick={handleNewDocument}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Document
          </Button>
        </div>
        <Button size={"icon-sm"} variant={"outline"} className="rounded-full absolute bottom-6 w-fit mx-auto animate-bounce">
          <MoveDown />
        </Button>
      </div>

      <Separator className="bg-border w-3/4 mx-auto" />

      {/* Projects Section */}
      <main className="flex-1 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-semibold tracking-tight">
              Your Projects
            </h2>
            <Button
              variant="outline"
              onClick={handleNewDocument}
              className="flex items-center gap-2 text-sm border-border hover:bg-card"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground text-sm animate-pulse">
              Loading projects...
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => handleOpenProject(p)}
                  className="group bg-card border border-border transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden"
                >
                  <CardHeader className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl truncate">
                        {p.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2 text-muted-foreground text-sm">
                      {p.client ?? p.matter_number ?? "Unspecified matter"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Last updated:{" "}
                        {new Date(
                          p.updated_at || Date.now()
                        ).toLocaleDateString()}
                      </span>
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                      >
                        Open Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm mt-12">
              No projects yet. Create your first document above!
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 mt-auto bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-foreground">
            © 2025 LegalTex. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
