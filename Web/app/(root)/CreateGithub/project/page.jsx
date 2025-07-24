"use client";
import { useSearchParams } from "next/navigation"; 
import useProject from "@/hooks/use-project";
import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, Github, FileText, Download, BarChart2 } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import mermaid from "mermaid";
import { toast } from 'react-hot-toast';
import dynamic from "next/dynamic";
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function MermaidChart({ chart }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && chart) {
      // Generate a unique id for each chart instance
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      ref.current.innerHTML = `<div class='mermaid' id='${id}'>${chart}</div>`;
      mermaid.init(undefined, `#${id}`);
    }
  }, [chart]);
  return <div ref={ref} className="w-full overflow-x-auto" />;
}

const ProjectPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id"); 
  const { projects } = useProject();

  // Show loading if projects are not loaded yet
  if (!projects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <div className="text-lg font-medium">Setting up your project...</div>
        <div className="text-sm text-muted-foreground mt-2">This may take a few seconds. Please wait while we create and index your project.</div>
      </div>
    );
  }

  const project = projects?.find((p) => p.id === projectId);

  // If project not found but projects are loaded, show a softer loading state (may be race condition)
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <div className="text-lg font-medium">Setting up your project...</div>
        <div className="text-sm text-muted-foreground mt-2">If this takes more than a few seconds, try refreshing the page.</div>
      </div>
    );
  }

  // Indexing status indicator
  let statusBanner = null;
  if (project.indexingStatus === 'pending' || project.indexingStatus === 'in_progress') {
    statusBanner = (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2 mb-4 animate-pulse">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>
          Indexing repository... This may take a few minutes. You can continue using the app.
        </span>
      </div>
    );
  } else if (project.indexingStatus === 'failed') {
    statusBanner = (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM12 17h.01" /></svg>
        <span>
          Indexing failed. Please try re-linking your repository or contact support.
        </span>
      </div>
    );
  } else if (project.indexingStatus === 'completed') {
    statusBanner = (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-4">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span>
          Repository indexed! You can now use all features.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4">
      {statusBanner}
      {/* Action Buttons */}
      <div className="mb-6 flex gap-2 justify-end flex-wrap">
        <GenerateReadmeButton project={project} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
              <BarChart2 className="w-5 h-5" />
              Visualize
            </Button>
          </DialogTrigger>
          <VisualizeModal project={project} />
        </Dialog>
      </div>
      {/* GitHub Link Section - Improved for mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="w-full sm:w-auto rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5" />
            <div className="ml-2">
              <p className="text-sm font-medium break-all">
                Linked to{' '}
                <Link 
                  href={project?.githubUrl ?? ""} 
                  className="inline-flex items-center hover:underline break-words"
                  target="_blank"
                >
                  {project?.githubUrl.split('/').slice(-2).join('/')}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card - Full width on mobile */}
      <div className="mb-8">
        <AskQuestionCard />
      </div>

      {/* Commit Log - Full width on all screens */}
      <div className="w-full overflow-x-auto">
        <CommitLog projectId={projectId} />
      </div>
    </div>
  );
};

// Utility to download markdown as file
function downloadMarkdown(content, filename = "README.md") {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// GenerateReadmeButton component
function GenerateReadmeButton({ project }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readme, setReadme] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setReadme("");
    setCopied(false);
    try {
      const res = await fetch("/api/generate-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.name,
          projectDescription: `GitHub Repo: ${project.githubUrl}`,
        }),
      });
      const data = await res.json();
      if (data.readme) {
        setReadme(data.readme);
        setOpen(true);
        toast.success('README generated!');
      } else {
        setError(data.error || "Failed to generate README.");
        toast.error(data.error || "Failed to generate README.");
      }
    } catch (err) {
      setError("Failed to generate README.");
      toast.error("Failed to generate README.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleGenerate} disabled={loading} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 bg-white">
        <FileText className="w-5 h-5" />
        {loading ? "Generating..." : "AI Generate README"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-2 sm:px-6 mx-4 sm:mx-auto">
          <DialogTitle className="mt-4">AI-Generated README</DialogTitle>
          <DialogDescription className="mt-1">Automatically generated README for your project. You can copy, download, or edit the markdown below.</DialogDescription>
          <div className="p-4 sm:p-6 min-h-[60vh] sm:min-h-[400px] flex flex-col gap-4 overflow-y-auto mt-2">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {readme ? (
              <>
                <div className="border rounded-md bg-gray-50 p-2 max-h-96 overflow-auto">
                  {editMode ? (
                    <MDEditor value={readme} height={350} onChange={setReadme} />
                  ) : (
                    <MDEditor value={readme} height={350} preview="preview" hideToolbar={true} />
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(readme);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied!" : "Copy Markdown"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadMarkdown(readme)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download .md
                  </Button>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    onClick={() => setEditMode((v) => !v)}
                  >
                    {editMode ? "Preview" : "Edit"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse min-h-[200px]">
                Generating README...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Visualize Modal Component
function VisualizeModal({ project }) {
  const [loading, setLoading] = useState(false);
  const [mermaid, setMermaid] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setMermaid("");
    setEditValue("");
    fetch("/api/visualize-structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName: project.name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mermaid) {
          setMermaid(data.mermaid);
          setEditValue(data.mermaid);
        } else {
          setError(data.error || "Failed to generate diagram.");
          toast.error(data.error || "Failed to generate diagram.");
        }
      })
      .catch(() => {
        setError("Failed to generate diagram.");
        toast.error("Failed to generate diagram.");
      })
      .finally(() => setLoading(false));
    // Show a single toast after diagram is set
    // (useEffect dependency on mermaid)
  }, [project.name]);
  useEffect(() => {
    if (mermaid) {
      toast.success('Diagram generated!');
    }
  }, [mermaid]);

  return (
    <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-2 sm:px-6 mx-4 sm:mx-auto">
      <DialogTitle className="flex items-center gap-2 mt-4">
        <BarChart2 className="w-6 h-6 text-primary" />
        Project Visualization
      </DialogTitle>
      <DialogDescription className="mt-1">Visual representation of your project structure as a file tree diagram.</DialogDescription>
      <div className="p-6 min-h-[300px] flex flex-col gap-4 mt-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse min-h-[200px]">
            Generating diagram...
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 min-h-[200px]">
            {error}
          </div>
        ) : mermaid ? (
          <>
            <div className="flex gap-2 mb-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([editMode ? editValue : mermaid], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "diagram.mmd";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download .mmd
              </Button>
              <Button
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode((v) => !v)}
              >
                {editMode ? "Preview" : "Edit"}
              </Button>
              {editMode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMermaid(editValue);
                    setEditMode(false);
                  }}
                >
                  Update Diagram
                </Button>
              )}
            </div>
            {editMode ? (
              <textarea
                className="w-full min-h-[200px] rounded border p-2 text-sm font-mono mb-2"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
              />
            ) : (
              <MermaidChart chart={mermaid} />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[200px]">
            No diagram available.
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default ProjectPage;