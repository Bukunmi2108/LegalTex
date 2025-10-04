import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import EditorPane from './components/EditorPane'
import PdfViewer from './components/PdfViewer'


export default function App(){
const [code, setCode] = useState<string>(`\\documentclass{article}\\n\\begin{document}\\nLegalTex sample\\n\\end{document}`)
const [pdfUrl, setPdfUrl] = useState<string | null>(null)
return (
<div className="h-screen flex bg-slate-50">
<Sidebar onSelect={(c)=>setCode(c)} />
<div className="flex-1 flex flex-col">
<div className="h-14 border-b px-4 flex items-center">
<h1 className="text-lg font-semibold">legalTex</h1>
</div>
<div className="flex flex-1">
<div className="w-1/2 border-r">
<EditorPane code={code} onChange={setCode} onPdfReady={setPdfUrl} />
</div>
<div className="w-1/2">
<PdfViewer blobUrl={pdfUrl} />
</div>
</div>
</div>
</div>
)
}