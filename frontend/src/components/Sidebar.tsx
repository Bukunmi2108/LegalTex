import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../services/api";
import { Menu } from "lucide-react";

interface SidebarProps {
  onSelect: (content: string) => void;
}

interface Project {
  id: string;
  title: string;
  client?: string;
  matter_number?: string;
  content: string;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (error: any) {
        toast.error("Failed to load projects");
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <aside
      className={`dark bg-background border-r border-border transition-all duration-300 ${
        open ? "w-72" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="h-14 px-3 flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md hover:bg-card transition"
        >
          <Menu className="w-4 h-4" />
        </button>
        {open && <div className="font-semibold text-foreground">Documents</div>}
      </div>

      {/* Project List */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-3.5rem)] space-y-1">
        {projects.length > 0 ? (
          projects.map((p) => (
            <div
              key={p.id}
              className="p-2 rounded-lg hover:bg-card cursor-pointer transition"
              onClick={() => onSelect(p.content)}
            >
              <div className="text-sm font-medium text-foreground truncate">
                {p.title}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {p.client ?? p.matter_number ?? "—"}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center mt-4">
            No documents found
          </div>
        )}
      </div>
    </aside>
  );
}
