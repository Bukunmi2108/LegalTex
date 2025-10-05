"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Proper worker configuration
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker as any;

interface PdfViewerProps {
  blobUrl: string | null;
}

export default function PdfViewer({ blobUrl }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Renders the selected PDF page
  const renderPage = async (pdf: any, pageNumber: number) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.25 });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  useEffect(() => {
    if (!blobUrl) return;

    let cancelled = false;
    let pdfInstance: any = null;

    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        pdfInstance = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdfInstance.numPages);
        await renderPage(pdfInstance, 1);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Could not display PDF file");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPDF();

    return () => {
      cancelled = true;
      pdfInstance = null;
    };
  }, [blobUrl]);

  const handlePrev = async () => {
    if (!blobUrl || currentPage <= 1) return;
    const pdf = await pdfjsLib.getDocument(blobUrl).promise;
    const newPage = currentPage - 1;
    setCurrentPage(newPage);
    await renderPage(pdf, newPage);
  };

  const handleNext = async () => {
    if (!blobUrl || currentPage >= pageCount) return;
    const pdf = await pdfjsLib.getDocument(blobUrl).promise;
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    await renderPage(pdf, newPage);
  };

  if (!blobUrl) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No preview available
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm animate-pulse">
        Loading PDF...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-between bg-muted/20 p-4 rounded-lg border border-border shadow-sm">
      {/* Canvas Preview */}
      <div className="flex-1 flex items-center justify-center w-full overflow-auto">
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Controls */}
      {pageCount > 1 && (
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm hover:bg-accent disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {pageCount}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === pageCount}
            className="px-3 py-1 rounded border text-sm hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
