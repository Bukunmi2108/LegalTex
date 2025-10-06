"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "../services/api";
import { Settings, FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAppStore } from "@/store/useAppStore";

interface SidebarProps {
  activeProjectId?: string | null;
}

const defaultContent = `\\documentclass{article}
\\begin{document}
New LegalTex document
\\end{document}`;

export default function Sidebar({ activeProjectId }: SidebarProps) {
  // Use store state and actions
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
    } catch (error) {
      toast.error("Failed to create new document.");
      console.error(error);
    }
  };

  return (
    <aside className="flex flex-col border-r border-border transition-all duration-300 w-full h-full p-2">
      <div className="p-2">
        <Button size={"sm"} variant={"outline"} className="w-full flex justify-start gap-2" onClick={handleNewDocument}>
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      <div className="flex-1 px-2 mt-2 overflow-y-auto space-y-1">
        {isLoading ? (
            <div className="text-sm text-muted-foreground text-center mt-4">Loading...</div>
        ) : projects.length > 0 ? (
          projects.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveProject(p)} // Use store action
              className={cn(
                "flex items-center gap-2 p-2 rounded-md cursor-pointer transition group",
                activeProjectId === p.id ? "bg-accent" : "hover:bg-accent"
              )}
            >
              <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {p.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.client ?? p.matter_number ?? "No client"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center mt-4">
            No documents found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-14 border-t border-border flex items-center justify-center">
        <button
          className="p-2 hover:bg-accent rounded-md transition"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}