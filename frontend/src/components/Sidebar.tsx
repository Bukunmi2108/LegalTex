import React, { useEffect, useState } from 'react'
import api from '../services/api'


export default function Sidebar({ onSelect }: { onSelect: (content:string)=>void }){
const [open, setOpen] = useState(true)
const [projects, setProjects] = useState<any[]>([])
useEffect(()=>{ (async ()=>{ try{ const res = await api.get('/projects'); setProjects(res.data) }catch(e){} })() }, [])
return (
<aside className={`bg-white border-r transition-all ${open ? 'w-72' : 'w-16'}`}>
<div className="h-14 px-3 flex items-center gap-2">
<button onClick={()=>setOpen(!open)} className="px-2 py-1 rounded border">{open ? 'Collapse' : '>'}</button>
{open && <div className="font-semibold">Documents</div>}
</div>
<div className="p-2 overflow-auto">
{projects.map(p => (
<div key={p.id} className="p-2 rounded hover:bg-slate-50 cursor-pointer" onClick={()=>onSelect(p.content)}>
<div className="text-sm font-medium">{p.title}</div>
<div className="text-xs text-slate-500">{p.client ?? p.matter_number}</div>
</div>
))}
</div>
</aside>
)
}