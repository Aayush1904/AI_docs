"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Download, 
  Send,
  Bot,
  User,
  Loader2
} from "lucide-react";

export default function IntegratedSearch() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I'm your document assistant. Ask me anything about your documents." }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: searchQuery,
          mode: 'search'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;

    const userMessage = { role: "user", content: chatQuery };
    setChatMessages(prev => [...prev, userMessage]);
    setChatQuery("");
    setIsChatting(true);

    try {
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: chatQuery,
          mode: 'chatbot'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = { 
          role: "assistant", 
          content: data.response || "Sorry, I couldn't process your request.",
          sources: data.sources || []
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = { 
          role: "assistant", 
          content: "Sorry, I encountered an error while processing your request." 
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { 
        role: "assistant", 
        content: "Sorry, I encountered an error while processing your request." 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleFileUpload = (event) => {
    console.log('File upload event triggered');
    const files = Array.from(event.target.files);
    console.log('Files selected:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleProcessDocuments = async () => {
    if (uploadedFiles.length === 0) return;

    try {
      console.log('Processing documents:', uploadedFiles.map(f => f.name));
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/process-documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Documents processed:', data);
        // Clear uploaded files after successful processing
        setUploadedFiles([]);
      } else {
        console.error('Failed to process documents');
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error processing documents:', error);
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'search') {
        handleSearch();
      } else if (type === 'chat') {
        handleChat();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Document Intelligence Engine</h1>
        <p className="text-gray-600">Search and chat with your documents using AI</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Hybrid Search
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Document Chatbot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Hybrid Search
              </CardTitle>
              <p className="text-sm text-gray-600">
                Search through your documents using a combination of keyword and semantic search.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'search')}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                  className="min-w-[100px]"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Found {searchResults.length} results
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {result.payload?.pdf_name || result.fileName || 'Unknown Document'}
                                </span>
                                {result.payload?.page && (
                                  <Badge variant="secondary">
                                    Page {result.payload.page}
                                  </Badge>
                                )}
                                {result.score && (
                                  <Badge variant="outline">
                                    Score: {result.score.toFixed(3)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {result.payload?.text || result.text || result.summary || 'No content available'}
                              </p>
                            </div>
                            {result.payload?.pdf_name && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4"
                                onClick={() => {
                                  // Handle PDF download
                                  const link = document.createElement('a');
                                  link.href = `/api/download-pdf?file=${encodeURIComponent(result.payload.pdf_name)}`;
                                  link.download = result.payload.pdf_name;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Document Chatbot
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ask questions about your documents. The chatbot will use the indexed content to find answers.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <Separator />
                              <p className="text-xs font-medium">Sources:</p>
                              {message.sources.map((source, sourceIndex) => (
                                <div key={sourceIndex} className="text-xs bg-white/50 rounded p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-3 w-3" />
                                    <span className="font-medium">
                                      {source.pdf_name} - Page {source.page}
                                    </span>
                                  </div>
                                  <p className="text-gray-600">
                                    {source.text?.substring(0, 150)}...
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about your documents..."
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'chat')}
                  className="flex-1 min-h-[60px] resize-none"
                  rows={2}
                />
                <Button 
                  onClick={handleChat} 
                  disabled={isChatting || !chatQuery.trim()}
                  className="self-end"
                >
                  {isChatting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <p className="text-sm text-gray-600">
            Upload PDF documents to make them searchable
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleProcessDocuments}
                disabled={uploadedFiles.length === 0}
              >
                Process Documents
              </Button>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{file.name}</span>
                      <Badge variant="secondary">{file.size} bytes</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 