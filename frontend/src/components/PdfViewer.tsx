"use client";

import { useState, useLayoutEffect } from "react"; // Added useLayoutEffect
import { Document, Page, pdfjs } from "react-pdf";
import { useAppStore } from "@/store/useAppStore";
import { Maximize, Minimize } from "lucide-react"; // Import icons
import "pdfjs-dist/web/pdf_viewer.css";


// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.93/pdf.worker.min.mjs"

export default function PdfViewer() {
  const blobUrl = useAppStore((state) => state.pdfUrl);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // State for full-screen mode and calculated width
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onLoadError = (err: Error) => {
    setError("Failed to load PDF");
    console.error(err);
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  // Calculate page width dynamically based on window size and full-screen state
  useLayoutEffect(() => {
    const calculateWidth = () => {
      // Base padding: p-4 = 16px on left/right, totaling 32px of horizontal margin
      const baseHorizontalPadding = 32; 
      let calculatedWidth = window.innerWidth - baseHorizontalPadding; 
      
      if (isFullScreen) {
        // Full screen: use most of the width, minus a bit more padding (e.g., 64px total margin)
        calculatedWidth = window.innerWidth - 64; 
      } else {
        // Split view: the container is half the screen width, but we want the PDF page to have a max width
        // Use a reasonable max width (e.g., 800px) that fits well within the split pane
        calculatedWidth = Math.min(800, window.innerWidth / 2 - baseHorizontalPadding);
      }
      
      // Ensure a minimum width for usability
      setPageWidth(Math.max(300, calculatedWidth));
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, [isFullScreen]);


  if (!blobUrl) {
    return <div className="h-full flex items-center justify-center text-foreground text-sm">No preview available</div>;
  }
  
  // Conditional class merging for the main container
  const mainContainerClasses = [
    "w-full h-full overflow-y-auto",
    isFullScreen 
      ? "fixed inset-0 z-50 p-4 bg-background dark:bg-card shadow-2xl" 
      : "bg-muted/10 p-4" // Normal view classes
  ].join(' ');

  return (
    <div className={mainContainerClasses}>
      
      {/* Full-screen Button */}
      <button
        onClick={toggleFullScreen}
        className={[
          "absolute z-50 p-2 rounded-full transition-colors",
          "bg-card/80 hover:bg-card text-foreground shadow-md",
          "top-4 right-4"
        ].join(' ')}
        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
      >
        {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>

      {/* Document rendering section */}
      <div className="flex flex-col items-center justify-start h-full">
        <Document
          file={blobUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onLoadError}
          loading={<div className="h-full flex items-center justify-center text-foreground text-sm animate-pulse">Loading PDF...</div>}
          error={<div className="h-full flex items-center justify-center text-red-500 text-sm">{error}</div>}
        >
          {/* Only render pages once the width is calculated and pages are loaded */}
          {pageWidth > 0 && Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              // Set the calculated width for the page
              width={pageWidth} 
              // Center the page component
              className="!mx-auto my-4" 
            />
          ))}
        </Document>
      </div>
    </div>
  );
}