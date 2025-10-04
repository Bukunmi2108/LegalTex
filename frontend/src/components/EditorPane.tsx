import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import api from '../services/api'


export default function EditorPane({ code, onChange, onPdfReady }: { code: string, onChange: (s:string)=>void, onPdfReady: (u:string|null)=>void }){
const debounceRef = useRef<number | undefined>()
useEffect(()=>{
window.clearTimeout(debounceRef.current)
debounceRef.current = window.setTimeout(async ()=>{
try{
const res = await api.post('/compile', { code }, { responseType: 'blob' })
const blob = new Blob([res.data], { type: 'application/pdf' })
const url = URL.createObjectURL(blob)
onPdfReady(url)
}catch(e){ onPdfReady(null) }
try{
const lint = await api.post('/lint', { code })
console.warn('lint', lint.data)
}catch(e){ }
}, 900)
return ()=> window.clearTimeout(debounceRef.current)
}, [code])


return (
<div className="h-full flex flex-col">
<div className="p-2 border-b flex items-center gap-2">
<button className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Save</button>
<button className="px-3 py-1 rounded border text-sm">Export PDF</button>
<button className="px-3 py-1 rounded border text-sm">Export .tex</button>
</div>
<div className="flex-1">
<Editor height="100%" language="latex" value={code} onChange={(v)=>onChange(v ?? '')} options={{ minimap: { enabled: false } }} theme="vs-dark" />
</div>
</div>
)
}