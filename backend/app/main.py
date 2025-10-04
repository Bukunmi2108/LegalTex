
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from .db import get_db, Base, engine
from .models import Project
from .latex_runner import compile_latex
from sqlalchemy.orm import Session
import io, tempfile, os, subprocess


Base.metadata.create_all(bind=engine)
app = FastAPI()


class CodeIn(BaseModel):
  code: str
  engine: str = 'pdflatex'


@app.post('/compile')
def compile_endpoint(payload: CodeIn):
  try:
    pdf_bytes = compile_latex(payload.code, payload.engine)
  except RuntimeError as e:
    return JSONResponse(status_code=400, content={'error': 'compilation failed', 'detail': str(e)})
  return StreamingResponse(io.BytesIO(pdf_bytes), media_type='application/pdf')


# lint using chktex
class LintIn(BaseModel):
  code: str


@app.post('/lint')
def lint_endpoint(payload: LintIn):
  with tempfile.NamedTemporaryFile(suffix='.tex', delete=False, mode='w', encoding='utf-8') as tf:
    tf.write(payload.code)
    tmpname = tf.name
  
  try:
    res = subprocess.run(['chktex', '-q', '-f', '%l:%c:%k:%n:%m\\n', tmpname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    out = res.stdout.decode('utf-8', errors='ignore')
    warnings = []
    for line in out.splitlines():
      parts = line.split(':', 4)
      if len(parts) == 5:
        line_no, col, kind, num, msg = parts
        warnings.append({'line': int(line_no), 'col': int(col), 'kind': kind, 'code': num, 'message': msg})
    return {'warnings': warnings}
  finally:
    try:
      os.unlink(tmpname)
    except Exception:
      pass

# Projects CRUD
class ProjectIn(BaseModel):
  title: str
  content: str
  matter_number: str | None = None
  client: str | None = None
  jurisdiction: str | None = None


@app.post('/projects')
def create_project(payload: ProjectIn, db: Session = Depends(get_db)):
  p = Project(title=payload.title, content=payload.content, matter_number=payload.matter_number, client=payload.client, jurisdiction=payload.jurisdiction)
  db.add(p)
  db.commit()
  db.refresh(p)
  return {'id': p.id}


@app.get('/projects')
def list_projects(db: Session = Depends(get_db)):
  items = db.query(Project).order_by(Project.updated_at.desc()).all()
  return items


@app.get('/projects/{project_id}')
def get_project(project_id: int, db: Session = Depends(get_db)):
  p = db.query(Project).filter(Project.id == project_id).first()
  if not p:
    raise HTTPException(404, 'Not found')
  return p


@app.put('/projects/{project_id}')
def update_project(project_id: int, payload: ProjectIn, db: Session = Depends(get_db)):
  p = db.query(Project).filter(Project.id == project_id).first()
  if not p:
    raise HTTPException(404, 'Not found')
  p.title = payload.title
  p.content = payload.content
  p.matter_number = payload.matter_number
  p.client = payload.client
  p.jurisdiction = payload.jurisdiction
  db.commit()
  return {'ok': True}