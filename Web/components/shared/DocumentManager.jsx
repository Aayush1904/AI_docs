"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Settings,
  Users,
  Eye,
  Lock,
  Shield,
  Globe,
  MoreVertical,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Loader2
} from "lucide-react";
import AccessLevelSelector, { AccessLevelBadge } from "./AccessLevelSelector";

export default function DocumentManager() {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("restricted");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchDocuments();
        showNotification(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`);
      } else {
        console.error('Failed to upload documents');
        showNotification('Failed to upload documents', 'error');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      showNotification('Error uploading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocuments = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/process-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: documents.filter(doc => !doc.isProcessed).map(doc => doc.fileName)
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Processing result:', result);
        // Refresh documents to show updated processing status
        await fetchDocuments();
        showNotification('Documents processed successfully!');
      } else {
        console.error('Failed to process documents');
        showNotification('Failed to process documents', 'error');
      }
    } catch (error) {
      console.error('Error processing documents:', error);
      showNotification('Error processing documents', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedDocument || !userEmail.trim()) return;

    try {
      const response = await fetch('/api/documents/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          userEmail,
          accessLevel: selectedAccessLevel
        })
      });

      if (response.ok) {
        setAccessDialogOpen(false);
        setUserEmail("");
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error granting access:', error);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    try {
      const response = await fetch(`/api/documents/access/${accessId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const unprocessedDocuments = documents.filter(doc => !doc.isProcessed);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload PDF documents and set access levels
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
            </div>
            
            {/* Process Documents Button */}
            {unprocessedDocuments.length > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {unprocessedDocuments.length} document{unprocessedDocuments.length > 1 ? 's' : ''} ready for processing
                  </p>
                  {processing && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Processing documents... This may take a few minutes</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleProcessDocuments}
                  disabled={processing}
                  className="flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Process Documents
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">{doc.name}</h3>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(doc.fileSize)} • {doc.mimeType}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <AccessLevelBadge level={doc.accessLevel} size="sm" />
                          <Badge 
                            variant={doc.isProcessed ? "default" : "secondary"} 
                            className={`text-xs ${doc.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {doc.isProcessed ? "Processed" : "Pending Processing"}
                          </Badge>
                          {getStatusIcon(doc.processingStatus)}
                        </div>

                        {!doc.isProcessed && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center gap-2 text-sm text-yellow-700">
                              <Clock className="h-3 w-3" />
                              <span>Document needs processing to be searchable</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.user?.firstName} {doc.user?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setAccessDialogOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4" />
                          Access
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Access List */}
                    {doc.accesses && doc.accesses.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Access Granted To:</h4>
                        <div className="space-y-2">
                          {doc.accesses.map((access) => (
                            <div key={access.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span>{access.user?.firstName} {access.user?.lastName}</span>
                                <span className="text-gray-500">({access.user?.emailAddress})</span>
                                <AccessLevelBadge level={access.accessLevel} size="sm" />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeAccess(access.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Management Dialog */}
      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Document Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Document</label>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDocument?.name}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">User Email</label>
              <Input
                type="email"
                placeholder="Enter user email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Access Level</label>
              <div className="mt-1">
                <AccessLevelSelector
                  value={selectedAccessLevel}
                  onChange={setSelectedAccessLevel}
                  size="sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGrantAccess}
                disabled={!userEmail.trim()}
                className="flex-1"
              >
                Grant Access
              </Button>
              <Button
                variant="outline"
                onClick={() => setAccessDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 