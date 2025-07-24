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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
        {/* Only keep non-AI doc action buttons here, if any. Remove Visualize button. */}
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

      {/* AI Documentation Tools Section */}
      <div className="mb-8">
        <div className="border rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">AI Documentation Tools</h2>
          <p className="text-gray-600 mb-4">Generate, comment, summarize, and visualize your code and docs with a single click. Powered by Gemini AI.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GenerateReadmeButton project={project} />
            <GenerateApiDocsButton project={project} />
            <GenerateCodeCommentsButton />
            <GenerateFileSummaryButton />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 bg-white w-full">
                  <BarChart2 className="w-5 h-5" />
                  Visualize
                </Button>
              </DialogTrigger>
              <VisualizeModal project={project} />
            </Dialog>
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

// GenerateApiDocsButton component
function GenerateApiDocsButton({ project }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiDocs, setApiDocs] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setApiDocs("");
    setCopied(false);
    try {
      // For demo, use a placeholder codeContext. In production, gather real code context.
      const codeContext = "[Insert code or endpoint context here]";
      const res = await fetch("/api/generate-api-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.name,
          codeContext,
        }),
      });
      const data = await res.json();
      if (data.apiDocs) {
        setApiDocs(data.apiDocs);
        setOpen(true);
        toast.success('API Docs generated!');
      } else {
        setError(data.error || "Failed to generate API Docs.");
        toast.error(data.error || "Failed to generate API Docs.");
      }
    } catch (err) {
      setError("Failed to generate API Docs.");
      toast.error("Failed to generate API Docs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleGenerate} disabled={loading} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 bg-white">
        <FileText className="w-5 h-5" />
        {loading ? "Generating..." : "AI Generate API Docs"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-2 sm:px-6 mx-4 sm:mx-auto">
          <DialogTitle className="mt-4">AI-Generated API Docs</DialogTitle>
          <DialogDescription className="mt-1">Automatically generated API documentation for your project. You can copy, download, or edit the markdown below.</DialogDescription>
          <div className="p-4 sm:p-6 min-h-[60vh] sm:min-h-[400px] flex flex-col gap-4 overflow-y-auto mt-2">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {apiDocs ? (
              <>
                <div className="border rounded-md bg-gray-50 p-2 max-h-96 overflow-auto">
                  {editMode ? (
                    <MDEditor value={apiDocs} height={350} onChange={setApiDocs} />
                  ) : (
                    <MDEditor value={apiDocs} height={350} preview="preview" hideToolbar={true} />
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(apiDocs);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied!" : "Copy Markdown"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadMarkdown(apiDocs, "API_DOCS.md")}
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
                Generating API Docs...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// GenerateCodeCommentsButton component
function GenerateCodeCommentsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [commentedCode, setCommentedCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setCommentedCode("");
    setCopied(false);
    try {
      const res = await fetch("/api/generate-code-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode }),
      });
      const data = await res.json();
      if (data.commentedCode) {
        setCommentedCode(data.commentedCode);
        setOpen(true);
      } else {
        setError(data.error || "Failed to generate code comments.");
      }
    } catch (err) {
      setError("Failed to generate code comments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 bg-white">
        <FileText className="w-5 h-5" />
        AI Add Code Comments
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-2 sm:px-6 mx-4 sm:mx-auto">
          <DialogTitle className="mt-4">AI-Generated Code Comments</DialogTitle>
          <DialogDescription className="mt-1">Paste your code below. The AI will add clear, concise comments. You can copy, download, or edit the result.</DialogDescription>
          <div className="p-4 sm:p-6 min-h-[60vh] sm:min-h-[400px] flex flex-col gap-4 overflow-y-auto mt-2">
            <textarea
              className="w-full border rounded-md p-2 min-h-[120px] font-mono text-sm"
              placeholder="Paste your code here..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleGenerate} disabled={loading || !inputCode} variant="default">
              {loading ? "Generating..." : "Generate Comments"}
            </Button>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {commentedCode && (
              <>
                <div className="border rounded-md bg-gray-50 p-2 max-h-96 overflow-auto">
                  {editMode ? (
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[120px] font-mono text-sm"
                      value={commentedCode}
                      onChange={e => setCommentedCode(e.target.value)}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs">{commentedCode}</pre>
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(commentedCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadMarkdown(commentedCode, "COMMENTED_CODE.txt")}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    onClick={() => setEditMode((v) => !v)}
                  >
                    {editMode ? "Preview" : "Edit"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// GenerateFileSummaryButton component
function GenerateFileSummaryButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    setCopied(false);
    try {
      const res = await fetch("/api/generate-file-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        setOpen(true);
      } else {
        setError(data.error || "Failed to generate file summary.");
      }
    } catch (err) {
      setError("Failed to generate file summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 bg-white">
        <FileText className="w-5 h-5" />
        AI Summarize File
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-2 sm:px-6 mx-4 sm:mx-auto">
          <DialogTitle className="mt-4">AI-Generated File Summary</DialogTitle>
          <DialogDescription className="mt-1">Paste your code below. The AI will summarize the file's purpose and main functions. You can copy, download, or edit the result.</DialogDescription>
          <div className="p-4 sm:p-6 min-h-[60vh] sm:min-h-[400px] flex flex-col gap-4 overflow-y-auto mt-2">
            <textarea
              className="w-full border rounded-md p-2 min-h-[120px] font-mono text-sm"
              placeholder="Paste your code here..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleGenerate} disabled={loading || !inputCode} variant="default">
              {loading ? "Generating..." : "Generate Summary"}
            </Button>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {summary && (
              <>
                <div className="border rounded-md bg-gray-50 p-2 max-h-96 overflow-auto">
                  {editMode ? (
                    <textarea
                      className="w-full border rounded-md p-2 min-h-[120px] font-mono text-sm"
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs">{summary}</pre>
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(summary);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied!" : "Copy Markdown"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadMarkdown(summary, "FILE_SUMMARY.md")}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    onClick={() => setEditMode((v) => !v)}
                  >
                    {editMode ? "Preview" : "Edit"}
                  </Button>
                </div>
              </>
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
  const [tab, setTab] = useState("file-tree");

  // Helper to fetch diagram from the correct endpoint
  const fetchDiagram = async (type) => {
    setLoading(true);
    setError("");
    setMermaid("");
    setEditValue("");
    let url = "/api/visualize-structure";
    let body = { projectId: project.id, projectName: project.name };
    if (type === "class-diagram") url = "/api/visualize-class-diagram";
    if (type === "dependency-graph") url = "/api/visualize-dependency-graph";
    if (type === "mind-map") url = "/api/visualize-mind-map";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.mermaid) {
        setMermaid(data.mermaid);
        setEditValue(data.mermaid);
      } else {
        setError(data.error || "Failed to generate diagram.");
        toast.error(data.error || "Failed to generate diagram.");
      }
    } catch {
      setError("Failed to generate diagram.");
      toast.error("Failed to generate diagram.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagram(tab);
    // eslint-disable-next-line
  }, [project.name, tab]);

  useEffect(() => {
    if (mermaid) {
      toast.success('Diagram generated!');
    }
  }, [mermaid]);

  return (
    <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-screen-xl p-0 bg-white rounded-xl shadow-xl px-1 sm:px-6 mx-1 sm:mx-auto">
      <DialogTitle className="flex items-center gap-2 mt-4 text-base sm:text-lg">
        <BarChart2 className="w-6 h-6 text-primary" />
        Project Visualization
      </DialogTitle>
      <DialogDescription className="mt-1 text-xs sm:text-base">Visualize your project as a file tree, class diagram, dependency graph, or mind map.</DialogDescription>
      <div className="p-2 sm:p-6 min-h-[350px] sm:min-h-[500px] flex flex-col gap-4 mt-2 w-full">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-2 sm:mb-4 flex gap-1 sm:gap-2 flex-wrap">
            <TabsTrigger value="file-tree">File Tree</TabsTrigger>
            <TabsTrigger value="class-diagram">Class Diagram</TabsTrigger>
            <TabsTrigger value="dependency-graph">Dependency Graph</TabsTrigger>
            <TabsTrigger value="mind-map">Mind Map</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="w-full">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse min-h-[200px] sm:min-h-[350px]">
                Generating diagram...
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-500 min-h-[200px] sm:min-h-[350px]">
                {error}
              </div>
            ) : mermaid ? (
              <>
                <div className="flex gap-2 mb-2 flex-wrap mt-12">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([editMode ? editValue : mermaid], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${tab}-diagram.mmd`;
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
                    className="w-full min-h-[200px] sm:min-h-[350px] rounded border p-2 text-xs sm:text-sm font-mono mb-2 mt-4"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  />
                ) : (
                  <div className="w-full max-w-full overflow-x-auto rounded border bg-white p-1 sm:p-2 mt-4 flex justify-center">
                    <div style={{ width: '100%', minWidth: 320, maxWidth: 1200 }}>
                      <MermaidChart chart={mermaid} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[200px] sm:min-h-[350px]">
                No diagram available.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
}

export default ProjectPage;