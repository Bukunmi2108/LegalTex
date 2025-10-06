import { create } from 'zustand';

export interface Project {
  id: string;
  title: string;
  content: string;
  client?: string;
  matter_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface AppState {
  activeProject: Project | null;
  pdfUrl: string | null;
  sidebarOpen: boolean;
  editorCode: string;
  
  // Sidebar State
  projects: Project[];
  projectsLoading: boolean;
}

interface AppActions {
  // Global Actions
  setActiveProject: (project: Project | null) => void;
  setPdfUrl: (url: string | null) => void;
  toggleSidebar: () => void;
  setEditorCode: (code: string) => void;
  
  // Sidebar Actions
  setProjects: (projects: Project[]) => void;
  setProjectsLoading: (loading: boolean) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
}

const defaultProjectContent = `\\documentclass{article}
\\title{Untitled Document}
\\author{LegalTex User}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

Welcome to LegalTex!

This is a sample document. You can start editing the LaTeX code on the left, and the PDF preview will update automatically on the right.

To create a new document, click the "New Document" button in the sidebar. To save your changes, use the "Save" button in the editor's toolbar.

\\end{document}
`;


export const useAppStore = create<AppState & AppActions>((set) => ({
  // State
  activeProject: null,
  pdfUrl: null,
  sidebarOpen: false,
  editorCode: defaultProjectContent,
  projects: [],
  projectsLoading: false,

  // Actions
  setActiveProject: (project) => set(() => ({ 
    activeProject: project, 
    editorCode: project ? project.content : defaultProjectContent 
  })),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setEditorCode: (code) => set({ editorCode: code }),
  
  setProjects: (projects) => set({ projects: projects }),
  setProjectsLoading: (loading) => set({ projectsLoading: loading }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (updatedProject) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ),
    activeProject: state.activeProject?.id === updatedProject.id ? updatedProject : state.activeProject
  }))
}));