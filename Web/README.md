# NeuralDocs - AI-Powered Document Search Engine

NeuralDocs is a cutting-edge AI-powered search engine that revolutionizes how you find and interact with your documents, code repositories, and knowledge bases. Built with modern web technologies and powered by Google's Gemini AI, it provides semantic search capabilities that understand context and meaning, not just keywords.

## 🚀 Features

### Core Features

- **🔍 AI-Powered Semantic Search**: Find information using natural language queries with context-aware results
- **📚 Multi-Source Integration**: Connect GitHub repositories, Slack, Notion, JIRA, and other platforms
- **🤖 Intelligent Q&A**: Ask questions about your codebase and get instant, AI-generated answers with code references
- **📊 Commit Analysis**: View and understand recent commits with AI-generated summaries
- **👥 User Management**: Secure authentication with role-based access control
- **📱 Responsive Design**: Modern, mobile-friendly interface with smooth animations

### Advanced Features

- **🔐 Access Control**: Document-level permissions with public, private, restricted, and confidential access levels
- **📈 Real-time Processing**: Live document indexing and processing status
- **🎨 Rich UI/UX**: Beautiful animations, Lottie graphics, and interactive components
- **⚡ Performance Optimized**: Fast search with vector embeddings and efficient database queries
- **🔧 API-First**: Comprehensive REST API for integration with external tools

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.2.3 with React 19
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives with custom components
- **Animations**: Framer Motion, Lottie React, React Parallax
- **State Management**: TanStack Query (React Query)
- **Authentication**: Clerk for secure user management
- **Icons**: Lucide React, React Icons

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Vector Search**: PostgreSQL with pgvector extension
- **AI Integration**: Google Gemini AI (1.5 Flash, text-embedding-004)
- **Authentication**: Clerk middleware
- **API**: RESTful API with comprehensive endpoints

### Development Tools

- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Database Migrations**: Prisma migrations
- **Environment**: dotenv for configuration
- **Development**: nodemon for hot reloading

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai_docs/Web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
# Copy the example environment file
cp env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5001"
NEXT_PUBLIC_NEXT_API_URL=""

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/neuraldocs"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/search"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/search"

# AI Services
GEMINI_API_KEY="your_gemini_api_key"

# GitHub Integration
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Server Configuration
PORT=5001
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the Development Server

```bash
# Start the Next.js frontend (port 3000)
npm run dev

# In a separate terminal, start the Express backend (port 5001)
npm run server
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: PostgreSQL on localhost:5432

## 📁 Project Structure

```
Web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/                   # Main application pages
│   │   ├── api/                  # API routes
│   │   ├── search/               # Search interface
│   │   ├── CreateGithub/         # GitHub integration
│   │   └── knowledge-integration/ # Knowledge management
│   ├── globals.css               # Global styles
│   └── layout.js                 # Root layout
├── components/                   # React components
│   ├── core/                     # Core UI components
│   ├── shared/                   # Shared components
│   ├── ui/                       # Base UI components
│   └── kokonutui/                # Custom UI components
├── lib/                          # Utility libraries
│   ├── integrations/             # Third-party integrations
│   ├── search/                   # Search functionality
│   ├── gemini.js                 # AI integration
│   └── utils.js                  # Helper functions
├── prisma/                       # Database schema and migrations
├── server/                       # Express.js backend
│   ├── api/                      # Backend API routes
│   └── middleware/               # Custom middleware
├── public/                       # Static assets
└── hooks/                        # Custom React hooks
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Search & AI

- `POST /api/semantic-search` - Perform semantic search
- `POST /api/ai-process` - AI-powered document processing
- `POST /api/generate-readme` - Generate README files
- `POST /api/generate-api-docs` - Generate API documentation

### Documents

- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id/access` - Update document access

### Integrations

- `GET /api/integrations` - List available integrations
- `POST /api/integrations/auth` - Authenticate with external service
- `GET /api/integrations/search` - Search across integrations

## 🎯 Usage Examples

### Basic Search

```javascript
// Search for information about authentication
const response = await fetch("/api/semantic-search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "How does user authentication work?",
    projectId: "your-project-id",
  }),
});
```

### Document Upload

```javascript
// Upload a document
const formData = new FormData();
formData.append("file", file);
formData.append("accessLevel", "private");

const response = await fetch("/api/documents/upload", {
  method: "POST",
  body: formData,
});
```

### AI-Powered Q&A

```javascript
// Ask a question about your codebase
const response = await fetch("/api/ai-process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "What is the main purpose of the authentication module?",
    projectId: "your-project-id",
  }),
});
```

## 🔐 Security Features

- **Authentication**: Secure user authentication with Clerk
- **Authorization**: Role-based access control (Admin, Manager, User, Viewer)
- **Document Security**: Multi-level access control (Public, Private, Restricted, Confidential)
- **API Security**: Rate limiting and input validation
- **Data Protection**: Encrypted storage and secure API keys

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly configured in your production environment, including:

- Database connection strings
- API keys for AI services
- Authentication credentials
- GitHub integration tokens

### Docker Deployment (Optional)

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the FAQ section in the application

## 🔮 Roadmap

### Upcoming Features

- **Enhanced Integrations**: Slack, Notion, Confluence, JIRA, Google Drive
- **Advanced AI**: Contextual memory, follow-up questions, chat interface
- **Documentation Generation**: Automated README, API docs, code comments
- **Visualization**: Class diagrams, dependency graphs, mind maps
- **Collaboration**: Inline comments, annotations, review requests
- **Analytics**: Usage statistics, search trends, documentation coverage

### Enterprise Features

- **SSO Integration**: Single sign-on with enterprise providers
- **Audit Logs**: Comprehensive activity tracking
- **Bulk Operations**: Mass import/export capabilities
- **Custom Branding**: White-label solutions
- **Advanced Security**: Compliance features and enhanced encryption

---

**NeuralDocs** - Transforming how teams discover and interact with their knowledge. Built with ❤️ using modern web technologies and AI.
