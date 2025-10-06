"use client";

import Sidebar from "@/components/Sidebar";
import EditorPane from "@/components/EditorPane";
import PdfViewer from "@/components/PdfViewer";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/store/useAppStore"; 

// Project interface and default content moved to useAppStore.ts

export default function Editor() {
  const activeProject = useAppStore((state) => state.activeProject);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground dark">
      <Toaster richColors />
      {/* Top Navbar */}
      <header className="h-14 border-b px-4 flex items-center justify-between bg-card backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <h1 className="text-lg font-semibold tracking-tight select-none">
          Legal<span className="text-blue-600">Tex</span>
        </h1>
        <div className="text-xs text-foreground italic">
          LaTeX Editor for Legal Documents
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 border-r bg-card transition-all duration-300">
            <Sidebar
              activeProjectId={activeProject?.id}
            />
          </aside>
        )}

        {/* Editor + PDF Viewer */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2">
          <div className="border-r w-full h-full">
            <EditorPane
              onToggleSidebar={toggleSidebar}
            />
          </div>
          <div className="w-full bg-muted/30 h-full">
            <PdfViewer />
          </div>
        </section>
      </main>
    </div>
  );
}