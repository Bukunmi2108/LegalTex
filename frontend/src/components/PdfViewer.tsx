"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useAppStore } from "@/store/useAppStore";
import "pdfjs-dist/web/pdf_viewer.css";


// Set worker (do this once, e.g., in a layout or provider)
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.93/pdf.worker.min.mjs"

export default function PdfViewer() {
  const blobUrl = useAppStore((state) => state.pdfUrl);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onLoadError = (err: Error) => {
    setError("Failed to load PDF");
    console.error(err);
  };

  if (!blobUrl) {
    return <div className="h-full flex items-center justify-center text-foreground text-sm">No preview available</div>;
  }

  return (
    <div className="w-full h-full bg-muted/10 overflow-y-auto p-4">
      <Document
        file={blobUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onLoadError}
        loading={<div className="h-full flex items-center justify-center text-foreground text-sm animate-pulse">Loading PDF...</div>}
        error={<div className="h-full flex items-center justify-center text-red-500 text-sm">{error}</div>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} width={Math.min(800, window.innerWidth - 32)} />
        ))}
      </Document>
    </div>
  );
}