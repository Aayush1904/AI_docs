# Semantic Search Feature

## Overview
The semantic search feature has been integrated into the Github repository analysis tool, providing fast and intelligent search capabilities for code repositories.

## Features

### 1. Natural Language Search
- Search for code using natural language queries
- Find functions, classes, API endpoints, and more
- Understands context and meaning, not just keywords

### 2. Search History
- Automatically saves recent searches
- Quick access to previous queries
- Project-specific history storage

### 3. Search Suggestions
- Pre-defined search suggestions for common queries
- Quick access to popular search terms
- Helps users discover search capabilities

### 4. Language Filtering
- Filter results by programming language
- Supports JavaScript, TypeScript, Python, Java, C++, HTML, CSS, SQL
- Helps narrow down results to specific file types

### 5. Smart Result Display
- Shows similarity scores with color coding
- Displays file metadata (language, size)
- Code snippets with syntax highlighting
- File type icons for better visual identification

## Technical Implementation

### Frontend Components
- `SemanticSearchCard`: Main search interface component
- Integrated into project page with tabbed interface
- Uses existing UI components (Button, Card, Input, Badge)

### Backend API
- `/api/semantic-search`: Handles search requests
- Uses vector embeddings for semantic similarity
- Integrates with existing database schema
- Supports project-specific filtering

### Database Integration
- Uses existing `SourceCodeEmbedding` table
- Leverages vector similarity search
- Project-specific filtering via `projectId`

## Usage

### Basic Search
1. Navigate to a project page
2. Click on "Semantic Search" tab
3. Enter your search query
4. View results with similarity scores

### Advanced Features
- Use search suggestions for common queries
- Filter by programming language
- Access search history for quick re-searches
- Clear search history when needed

### Search Examples
- "function definition" - Find function definitions
- "class implementation" - Find class implementations
- "API endpoints" - Find API endpoint definitions
- "error handling" - Find error handling code
- "authentication" - Find authentication-related code

## File Structure

```
Web/app/(root)/CreateGithub/project/
├── semantic-search-card.jsx    # Main search component
├── page.jsx                    # Updated to include search tabs
└── actions.js                  # Existing RAG pipeline

Web/app/(root)/api/
└── semantic-search/
    └── route.js                # Search API endpoint

Web/components/ui/
└── badge.jsx                  # New Badge component
```

## Dependencies
- Uses existing embedding generation from `lib/gemini.js`
- Integrates with existing database schema
- Leverages existing UI components
- Uses `class-variance-authority` for Badge component

## Performance
- Fast vector similarity search
- Client-side language filtering
- Efficient result caching
- Minimal API calls

## Future Enhancements
- Advanced filtering options
- Search result export
- Collaborative search features
- Search analytics and insights 