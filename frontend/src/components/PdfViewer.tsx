import React, { useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'


export default function PdfViewer({ blobUrl }: { blobUrl: string | null }){
const canvasRef = useRef<HTMLCanvasElement | null>(null)
useEffect(()=>{
if(!blobUrl) return
let cancelled = false
;(async ()=>{
const pdf = await pdfjsLib.getDocument(blobUrl).promise
if(cancelled) return
const page = await pdf.getPage(1)
const viewport = page.getViewport({ scale: 1.25 })
const canvas = canvasRef.current!
canvas.width = viewport.width
canvas.height = viewport.height
const ctx = canvas.getContext('2d')!
await page.render({ canvasContext: ctx, viewport }).promise
})()
return ()=>{ cancelled = true }
}, [blobUrl])


if(!blobUrl) return <div className="h-full flex items-center justify-center text-gray-400">No preview</div>
return (
<div className="h-full p-3"><canvas ref={canvasRef} className="shadow rounded" /></div>
)
}