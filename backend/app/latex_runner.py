import os
import tempfile
import subprocess


def compile_latex(code: str, engine: str = "pdflatex") -> bytes:
    """Compile LaTeX code to PDF and return PDF bytes."""

    # Use context manager so the temp directory exists for the whole operation
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, "doc.tex")
        pdf_path = os.path.join(tmpdir, "doc.pdf")

        # ✅ Write LaTeX source inside the temp folder
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(code)

        # ✅ Run LaTeX compiler
        result = subprocess.run(
            [engine, "-interaction=nonstopmode", tex_path],
            cwd=tmpdir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Optional: log errors for debugging
        if result.returncode != 0:
            print("LaTeX compilation failed:")
            print(result.stdout)
            print(result.stderr)

        # ✅ Ensure PDF was produced
        if not os.path.exists(pdf_path):
            raise FileNotFoundError("LaTeX compilation failed — no PDF output found")

        # ✅ Read PDF bytes before temp folder is deleted
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        return pdf_bytes
