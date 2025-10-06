"use client";

import { useEffect, useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import api from "../services/api";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  PanelLeftOpen,
  Save,
  Download,
  FileText,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore"; // <--- Updated import

interface EditorPaneProps {
  onToggleSidebar: () => void;
}

export default function EditorPane({
  onToggleSidebar,
}: EditorPaneProps) {
  // Use store state and actions
  const project = useAppStore((state) => state.activeProject);
  const code = useAppStore((state) => state.editorCode);
  const setEditorCode = useAppStore((state) => state.setEditorCode);
  const setPdfUrl = useAppStore((state) => state.setPdfUrl);
  const updateProject = useAppStore((state) => state.updateProject);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const debounceRef = useRef<number | null>(null);
  
  // CACHING REFS to prevent infinite re-rendering from new Blob URLs
  const lastCompiledCodeRef = useRef<string | null>(null); 
  const lastPdfUrlRef = useRef<string | null>(null);
  
  // ========== MONACO SETUP ==========
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // ========== SAVE DOCUMENT ==========
  const handleSave = async () => {
    if (!project) {
      toast.error("No active project selected to save.");
      return;
    }
    try {
      const res = await api.put(`/projects/${project.id}`, {
        title: project.title,
        content: code,
      });
      updateProject(res.data); // Use store action
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document.");
    }
  };

  // ========== EXPORT PDF ==========
  const handleExportPDF = async () => {
    if (!project) {
      toast.error("No project available to export.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error(`Error compiling LaTeX: ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Create and click a temporary download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.title || "document"}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url); // Clean up temporary URL

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF.");
    }
  };

  // ========== EXPORT .TEX ==========
  const handleExportTex = () => {
    if (!project) {
      toast.error("No project available to export.");
      return;
    }

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title || "document"}.tex`;
    link.click();
    
    URL.revokeObjectURL(url); // Clean up temporary URL
    
    toast.success(".tex file downloaded!");
  };

  // ========== COMPILE & LINT (Modified for Caching) ==========
  const compileAndLint = useCallback(
    async (currentCode: string) => {
      // 1. BREAK THE LOOP: Check if the code has actually changed from the last successful compile
      if (lastCompiledCodeRef.current === currentCode) {
        console.log("Skipping compileAndLint: Code unchanged");
        return;
      }

      if (!currentCode.trim()) {
        console.log("Skipping compileAndLint: Code is empty");
        return;
      }

      // --- Compile PDF ---
      try {
        const res = await fetch("http://localhost:8000/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: currentCode }),
        });

        if (!res.ok) {
          throw new Error(`Error compiling LaTeX: ${res.statusText}`);
        }

        // Clean up previous URL BEFORE creating a new one
        if (lastPdfUrlRef.current && lastPdfUrlRef.current !== lastCompiledCodeRef.current) {
          console.log("Revoking old blobUrl:", lastPdfUrlRef.current);
          URL.revokeObjectURL(lastPdfUrlRef.current);
          lastPdfUrlRef.current = null;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        console.log("Setting new pdfUrl:", url);
        setPdfUrl(url); // Use store action
        
        // Update cache on success
        lastCompiledCodeRef.current = currentCode; 
        lastPdfUrlRef.current = url; 

      } catch (err) {
        console.error("PDF compile error:", err);
        toast.error("PDF compilation failed. Check your LaTeX syntax.");
        // Keep the last valid PDF
      }

      // --- Lint LaTeX code ---
      try {
        const lint = await api.post("/lint", { code: currentCode });
        const model = editorRef.current?.getModel();
        if (!model) return;

        monaco.editor.setModelMarkers(model, "latex-linter", []); // Clear old markers

        const warnings = lint.data?.warnings || [];
        if (warnings.length > 0) {
          const markers = warnings.map((w: any) => ({
            startLineNumber: w.line,
            startColumn: w.col,
            endLineNumber: w.col + 1,
            message: w.message,
            severity: monaco.MarkerSeverity.Warning,
          }));
          monaco.editor.setModelMarkers(model, "latex-linter", markers);
        }
      } catch (err) {
        console.error("Lint error:", err);
      }
    },
    [setPdfUrl]
  );

  // ========== DEBOUNCED COMPILE/LINT ==========
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      compileAndLint(code);
    }, 900);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code, compileAndLint]);

  // CLEANUP: Revoke the final URL when the component unmounts
  useEffect(() => {
    return () => {
      if (lastPdfUrlRef.current) {
        URL.revokeObjectURL(lastPdfUrlRef.current);
      }
    };
  }, []);

  // ========== RENDER ==========
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-2 border-b flex items-center gap-2 bg-muted/30 backdrop-blur-sm">
        <Button size="icon" variant="ghost" onClick={onToggleSidebar}>
          <PanelLeftOpen className="w-5 h-5" />
        </Button>
        <Separator orientation="vertical" className="h-6" />

        <Button size="sm" onClick={handleSave} disabled={!project}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button size="sm" variant="outline" onClick={handleExportPDF} disabled={!project}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <Button size="sm" variant="ghost" onClick={handleExportTex} disabled={!project}>
          <FileText className="w-4 h-4 mr-2" />
          Export .tex
        </Button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="latex"
          value={code}
          onChange={(value) => setEditorCode(value ?? "")} // Use store action
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            language: "latex",
            "semanticHighlighting.enabled": true,
          }}
        />
      </div>
    </div>
  );
}