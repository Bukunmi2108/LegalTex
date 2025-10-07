# LegalTex

LegalTex is a web-based LaTeX editor designed specifically for creating and managing legal documents. It provides a user-friendly interface for writing LaTeX code, previewing the compiled PDF, and organizing documents in a project-based structure.

## Features

- **Real-time LaTeX Compilation**: Write LaTeX code and see the PDF output instantly.
- **Syntax Linting**: Detects common LaTeX errors using `chktex`.
- **Project Management**: Create, save, and organize documents with metadata like client and matter number.
- **Export Options**: Download documents as PDF or `.tex` files.
- **Responsive Design**: Intuitive interface with a sidebar, editor, and PDF viewer.
- **Dark Mode**: Monaco editor with a dark theme for comfortable coding.

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - Vite for fast development and bundling
  - Tailwind CSS for styling
  - Monaco Editor for LaTeX editing
  - PDF.js for rendering PDF previews
- **Backend**:
  - FastAPI for the API server
  - SQLAlchemy with SQLite for project storage
  - `pdflatex` for LaTeX compilation
  - `chktex` for LaTeX linting
- **Other**:
  - Axios for API requests
  - Sonner for toast notifications
  - Lucide React for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- `pdflatex` (included in TeX Live or MiKTeX)
- `chktex` (included in TeX Live)
- SQLite (included with Python)


## Usage

- **Create a New Document**: Click "New Document" in the sidebar to start with a blank LaTeX template.
- **Edit LaTeX**: Use the Monaco editor to write LaTeX code. The PDF preview updates automatically.
- **Save Projects**: Click "Save" to store the document in the SQLite database.
- **Export**: Use "Export" to download the PDF or "Export .tex" to download the LaTeX source.
- **Manage Projects**: View and select existing projects from the sidebar.

## Project Structure

```
legaltex/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── db.py          # Database configuration
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── latex_runner.py # LaTeX compilation logic
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── components/
│   │   ├── EditorPane.tsx  # LaTeX editor component
│   │   ├── PdfViewer.tsx   # PDF preview component
│   │   ├── Sidebar.tsx     # Project sidebar component
│   ├── services/
│   │   ├── api.ts         # Axios API client
│   ├── lib/
│   │   ├── utils.ts       # Utility functions
│   └── App.tsx            # Main React component
├── vite.config.ts         # Vite configuration
├── package.json           # Node dependencies
└── README.md              # This file
```

## Author

> Bukunmi Akinyemi