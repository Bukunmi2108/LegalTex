"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import EditorPane from "@/components/EditorPane";
import PdfViewer from "@/components/PdfViewer";

export default function App() {
  const [code, setCode] = useState<string>(
    `\\documentclass{article}\n\\begin{document}\nLegalTex sample\n\\end{document}`
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="h-14 border-b px-4 flex items-center justify-between bg-white/60 dark:bg-zinc-800/50 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <h1 className="text-lg font-semibold tracking-tight select-none">
          Legal<span className="text-blue-600">Tex</span>
        </h1>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          LaTeX Editor for Legal Documents
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 border-r bg-gray-100/50 dark:bg-zinc-800/40">
          <Sidebar onSelect={(content) => setCode(content)} />
        </aside>

        {/* Editor + PDF Viewer */}
        <section className="flex-1 flex border-l">
          {/* Left: LaTeX Editor */}
          <div className="w-1/2 border-r">
            <EditorPane code={code} onChange={setCode} onPdfReady={setPdfUrl} />
          </div>

          {/* Right: PDF Preview */}
          <div className="w-1/2 bg-muted/30">
            <PdfViewer blobUrl={pdfUrl} />
          </div>
        </section>
      </main>
    </div>
  );
}
