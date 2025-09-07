"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, FileText, Calendar, Clock, ExternalLink, Database } from "lucide-react";

const SearchDemo = ({ connectedSources, userIntegrations }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const demoResults = [
    {
      id: 1,
      title: "Q4 Marketing Strategy",
      source: "Notion",
      sourceIcon: FileText,
      sourceColor: "bg-black",
      snippet: "Our Q4 marketing strategy focuses on social media campaigns and influencer partnerships...",
      timestamp: "2 hours ago",
      url: "#"
    },
    {
      id: 2,
      title: "Bug Report: Login Issue",
      source: "JIRA",
      sourceIcon: Calendar,
      sourceColor: "bg-blue-600",
      snippet: "Users experiencing login failures on mobile devices. Priority: High. Status: In Progress...",
      timestamp: "1 day ago",
      url: "#"
    },
    {
      id: 3,
      title: "Team Meeting Notes",
      source: "Slack",
      sourceIcon: MessageSquare,
      sourceColor: "bg-purple-500",
      snippet: "Discussed the new feature rollout timeline. Key decisions: Launch on Monday, gradual rollout...",
      timestamp: "3 hours ago",
      url: "#"
    },
    {
      id: 4,
      title: "API Documentation",
      source: "Google Drive",
      sourceIcon: FileText,
      sourceColor: "bg-green-500",
      snippet: "Updated API documentation with new authentication methods and rate limiting guidelines...",
      timestamp: "5 hours ago",
      url: "#"
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use provided userIntegrations or get from localStorage
      const integrations = userIntegrations || {};
      const sources = ['google-drive', 'notion', 'jira'];
      
      // Fallback to localStorage if userIntegrations not provided
      if (Object.keys(integrations).length === 0) {
        sources.forEach(source => {
          const tokens = localStorage.getItem(`${source}_tokens`);
          if (tokens) {
            integrations[source] = JSON.parse(tokens);
            console.log('Loaded tokens for', source, ':', integrations[source]);
          }
        });
      }

      console.log('Using integrations for search:', integrations);

      // Perform unified search
      const response = await fetch('/api/integrations/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          userIntegrations: integrations
        }),
      });
      
      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.success) {
        console.log('Setting search results:', data.results.results);
        setSearchResults(data.results.results);
      } else {
        console.log('Search failed:', data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };



  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (connectedSources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-16"
      >
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect Sources to Enable Unified Search
              </h3>
              <p className="text-gray-600">
                Once you connect your knowledge sources, you'll be able to search across all of them from one place.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-16"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Unified Search Demo
          </CardTitle>
          <CardDescription>
            Search across all your connected sources with AI-powered intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
                        <Input
            placeholder="Search anything: 'my documents', 'recent files', 'pdfs', 'images', 'all files'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </div>
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  Found {searchResults.length} results across {connectedSources.length} sources
                </div>
                
                {searchResults.map((result, index) => {
                  const getSourceIcon = (source) => {
                    switch (source) {
                      case 'Google Drive': return FileText;
                      case 'JIRA': return Calendar;
                      case 'Notion': return Database;
                      default: return FileText;
                    }
                  };

                  const getSourceColor = (source) => {
                    switch (source) {
                      case 'Google Drive': return 'bg-blue-500';
                      case 'JIRA': return 'bg-orange-500';
                      case 'Notion': return 'bg-black';
                      default: return 'bg-gray-500';
                    }
                  };

                  const SourceIcon = getSourceIcon(result.source);
                  const sourceColor = getSourceColor(result.source);

                  return (
                    <motion.div
                      key={`${result.source}-${result.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${sourceColor} flex-shrink-0`}>
                              <SourceIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {result.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {result.source}
                                </Badge>
                                {result.type && (
                                  <Badge variant="secondary" className="text-xs">
                                    {result.type}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {typeof result.snippet === 'string' 
                                  ? result.snippet 
                                  : result.snippet?.content || result.title || 'No description available'
                                }
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {result.modifiedTime && (
                                    <span>{new Date(result.modifiedTime).toLocaleDateString()}</span>
                                  )}
                                  {result.timestamp && (
                                    <span>{new Date(result.timestamp * 1000).toLocaleDateString()}</span>
                                  )}
                                  {result.updated && (
                                    <span>{new Date(result.updated).toLocaleDateString()}</span>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={() => window.open(result.url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {searchQuery && !isSearching && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500"
              >
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm mb-4">Try these search examples:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "all files",
                    "recent documents", 
                    "pdf files",
                    "images",
                    "my documents",
                    "work files"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setTimeout(() => handleSearch(), 100);
                      }}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SearchDemo; 