import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import api from "../services/api";

interface EditorPaneProps {
  code: string;
  onChange: (value: string) => void;
  onPdfReady: (url: string | null) => void;
}

export default function EditorPane({ code, onChange, onPdfReady }: EditorPaneProps) {
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        // Compile LaTeX to PDF
        const res = await api.post("/compile", { code }, { responseType: "blob" });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        onPdfReady(url);
      } catch (err) {
        console.error("PDF compile error:", err);
        onPdfReady(null);
      }

      try {
        // Lint LaTeX syntax
        const lint = await api.post("/lint", { code });
        console.warn("Lint results:", lint.data);
      } catch (err) {
        console.error("Lint error:", err);
      }
    }, 900);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [code, onPdfReady]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-2 border-b flex items-center gap-2 bg-muted/30 backdrop-blur">
        <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition">
          Save
        </button>
        <button className="px-3 py-1 rounded border text-sm hover:bg-accent transition">
          Export PDF
        </button>
        <button className="px-3 py-1 rounded border text-sm hover:bg-accent transition">
          Export .tex
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="latex"
          value={code}
          onChange={(value) => onChange(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
