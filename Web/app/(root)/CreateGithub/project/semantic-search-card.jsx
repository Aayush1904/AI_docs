'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Code, Clock, History, Filter, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import useProject from '@/hooks/use-project';
import { toast } from 'react-hot-toast';

const SemanticSearchCard = () => {
    const { project } = useProject();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [expandedResults, setExpandedResults] = useState(new Set());

    // Load search history from localStorage on component mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(`searchHistory_${project?.id}`);
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, [project?.id]);

    const saveToHistory = (searchQuery) => {
        if (!searchQuery.trim()) return;
        
        const newHistory = [
            searchQuery,
            ...searchHistory.filter(item => item !== searchQuery)
        ].slice(0, 10); // Keep only last 10 searches
        
        setSearchHistory(newHistory);
        localStorage.setItem(`searchHistory_${project?.id}`, JSON.stringify(newHistory));
    };

    const handleSearch = async (e, searchQuery = null) => {
        e?.preventDefault();
        const queryToSearch = searchQuery || query.trim();
        
        if (!queryToSearch) {
            toast.error('Please enter a search query');
            return;
        }

        if (!project?.id) {
            toast.error('No project selected');
            return;
        }

        setLoading(true);
        setSearchPerformed(true);
        setShowHistory(false);

        try {
            const response = await fetch('/api/semantic-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: queryToSearch,
                    projectId: project.id,
                    filter: {
                        projectId: project.id,
                        language: selectedLanguage !== 'all' ? selectedLanguage : undefined
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Search failed');
            }

            const data = await response.json();
            setResults(data.results || []);
            
            if (!searchQuery) {
                saveToHistory(queryToSearch);
                setQuery(queryToSearch);
            }
            
            if (data.results?.length === 0) {
                toast('No results found for your query', {
                    icon: '🔍',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            } else {
                toast.success(`Found ${data.results?.length || 0} results`);
            }
        } catch (error) {
            console.error('Semantic search error:', error);
            toast.error(error.message || 'Search failed. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryClick = (historyItem) => {
        setQuery(historyItem);
        handleSearch(null, historyItem);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem(`searchHistory_${project?.id}`);
        toast.success('Search history cleared');
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
            return <Code className="w-4 h-4" />;
        }
        return <FileText className="w-4 h-4" />;
    };

    const formatScore = (score) => {
        return Math.round(score * 100);
    };

    const getScoreColor = (score) => {
        if (score >= 0.8) return 'bg-green-100 text-green-800';
        if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const toggleExpanded = (index) => {
        const newExpanded = new Set(expandedResults);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedResults(newExpanded);
    };

    const truncateText = (text, maxLength = 200) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const searchSuggestions = [
        'function definition',
        'class implementation',
        'API endpoints',
        'database queries',
        'error handling',
        'authentication',
        'configuration',
        'testing',
        'documentation',
        'dependencies'
    ];

    return (
        <div className="space-y-4">
            <div className="relative">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search for functions, classes, or concepts..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setShowHistory(searchHistory.length > 0)}
                            className="pr-10"
                            disabled={loading}
                        />
                        {query && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                onClick={() => setQuery('')}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                    <Button type="submit" disabled={loading || !query.trim()}>
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </Button>
                </form>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        <div className="p-2 border-b flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-1">
                                <History className="w-3 h-3" />
                                Recent Searches
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearHistory}
                                className="h-6 px-2 text-xs"
                            >
                                Clear
                            </Button>
                        </div>
                        {searchHistory.map((item, index) => (
                            <button
                                key={index}
                                className="w-full text-left p-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                onClick={() => handleHistoryClick(item)}
                            >
                                <Clock className="w-3 h-3 text-gray-400" />
                                {item}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Suggestions */}
            <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setQuery(suggestion);
                            handleSearch(null, suggestion);
                        }}
                        className="text-xs"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">Filter by language:</span>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                >
                    <option value="all">All Languages</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="SQL">SQL</option>
                </select>
            </div>

            {searchPerformed && (
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            <span className="ml-2">Searching...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                                Found {results.length} results
                            </div>
                            {results.map((result, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(result.fileName)}
                                            <span className="font-medium text-sm">
                                                {result.fileName}
                                            </span>
                                        </div>
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs ${getScoreColor(result.similarity)}`}
                                        >
                                            {formatScore(result.similarity)}% match
                                        </Badge>
                                    </div>
                                    
                                                                            {result.summary && (
                                            <div className="mb-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {expandedResults.has(index) 
                                                        ? result.summary 
                                                        : truncateText(result.summary, 150)
                                                    }
                                                </p>
                                                {result.summary.length > 150 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleExpanded(index)}
                                                        className="mt-1 text-xs"
                                                    >
                                                        {expandedResults.has(index) ? 'Show Less' : 'See More'}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {result.sourceCode && (
                                            <div className="bg-muted rounded p-3">
                                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                                    <code>
                                                        {expandedResults.has(index) 
                                                            ? result.sourceCode 
                                                            : truncateText(result.sourceCode, 300)
                                                        }
                                                    </code>
                                                </pre>
                                                {result.sourceCode.length > 300 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleExpanded(index)}
                                                        className="mt-2 text-xs"
                                                    >
                                                        {expandedResults.has(index) ? 'Show Less' : 'See More'}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    
                                    {result.metadata && (
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            {result.metadata.language && (
                                                <Badge variant="outline" className="text-xs">
                                                    {result.metadata.language}
                                                </Badge>
                                            )}
                                            {result.metadata.size && (
                                                <span>{result.metadata.size} bytes</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No results found</p>
                            <p className="text-sm">Try different keywords or check your query</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SemanticSearchCard; 