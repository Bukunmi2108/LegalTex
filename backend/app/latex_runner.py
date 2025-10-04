import subprocess, tempfile, os


def compile_latex(tex_source: str, engine: str = 'pdflatex') -> bytes:
  with tempfile.TemporaryDirectory() as tmp:
    tex_path = os.path.join(tmp, 'doc.tex')
  with open(tex_path, 'w', encoding='utf-8') as f:
    f.write(tex_source)
  if engine == 'tectonic':
    cmd = ['tectonic', '--keep-logs', tex_path]
  else:
    cmd = ['pdflatex', '-interaction=nonstopmode', 'doc.tex']
  try:
    subprocess.run(cmd, cwd=tmp, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if engine != 'tectonic':
      subprocess.run(cmd, cwd=tmp, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  except subprocess.CalledProcessError as e:
    stderr = e.stderr.decode(errors='ignore')
    raise RuntimeError(stderr)
  pdf_path = os.path.join(tmp, 'doc.pdf')
  if not os.path.exists(pdf_path):
    raise RuntimeError('PDF not produced')
  
  with open(pdf_path, 'rb') as f:
    return f.read()