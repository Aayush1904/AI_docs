# System Architecture Diagram

## 🏗️ Overall System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        Auth[Clerk Authentication]
        Components[React Components]
    end

    subgraph "Backend Services"
        API[Next.js API Routes]
        Server[Express Server]
        Prisma[Prisma ORM]
    end

    subgraph "External APIs"
        GitHub[GitHub API]
        Google[Google Drive API]
        Slack[Slack API]
        JIRA[JIRA API]
        Gemini[Gemini AI API]
    end

    subgraph "Database"
        DB[(Neon PostgreSQL)]
        VectorDB[Vector Extensions]
    end

    subgraph "AI Services"
        Embeddings[Code Embeddings]
        Summaries[AI Summaries]
        QnA[Q&A Generation]
    end

    UI --> Auth
    UI --> API
    API --> Server
    Server --> Prisma
    Prisma --> DB
    DB --> VectorDB

    API --> GitHub
    API --> Google
    API --> Slack
    API --> JIRA
    API --> Gemini

    Gemini --> Embeddings
    Gemini --> Summaries
    Gemini --> QnA

    Embeddings --> VectorDB
    Summaries --> DB
    QnA --> DB
```

## 🔗 GitHub Integration System

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as API Routes
    participant GH as GitHub API
    participant AI as Gemini AI
    participant DB as Database

    U->>UI: Create Project
    UI->>API: POST /api/project/create
    API->>DB: Create Project Record
    API->>GH: Fetch Repository Files
    GH-->>API: Repository Content
    API->>AI: Generate Embeddings
    AI-->>API: Vector Embeddings
    API->>DB: Store Embeddings
    API->>GH: Fetch Commits
    GH-->>API: Commit History
    API->>AI: Summarize Commits
    AI-->>API: Commit Summaries
    API->>DB: Store Commits
    API-->>UI: Project Created
    UI-->>U: Success Response

    Note over U,DB: Q&A Flow
    U->>UI: Ask Question
    UI->>API: POST /api/ai-process
    API->>DB: Query Embeddings
    DB-->>API: Relevant Code
    API->>AI: Generate Answer
    AI-->>API: AI Response
    API-->>UI: Answer with References
    UI-->>U: Display Answer
```

## 🔍 Multi-Source Knowledge Integration System

```mermaid
graph TB
    subgraph "OAuth Authentication Flow"
        User[User]
        App[Web App]
        OAuth[OAuth Provider]
        Token[Token Storage]

        User -->|1. Connect| App
        App -->|2. Generate Auth URL| OAuth
        OAuth -->|3. User Consent| User
        User -->|4. Authorization Code| App
        App -->|5. Exchange Code| OAuth
        OAuth -->|6. Access Token| App
        App -->|7. Store Tokens| Token
    end

    subgraph "Search Flow"
        Query[Search Query]
        Unified[Unified Search Service]
        Google[Google Drive API]
        Slack[Slack API]
        JIRA[JIRA API]
        Results[Search Results]

        Query --> Unified
        Unified --> Google
        Unified --> Slack
        Unified --> JIRA
        Google --> Results
        Slack --> Results
        JIRA --> Results
        Results --> Query
    end

    subgraph "Data Flow"
        Files[File Content]
        Messages[Slack Messages]
        Issues[JIRA Issues]
        Normalized[Normalized Results]
        Ranked[Ranked Results]

        Files --> Normalized
        Messages --> Normalized
        Issues --> Normalized
        Normalized --> Ranked
    end
```

## 📊 Detailed Component Architecture

```mermaid
graph TB
    subgraph "Frontend Components"
        Auth[Clerk Auth]
        Project[Project Management]
        Search[Semantic Search]
        QnA[Q&A Interface]
        Integrations[Knowledge Integration]
        Commits[Commit Viewer]
    end

    subgraph "API Layer"
        ProjectAPI[Project API]
        SearchAPI[Search API]
        QnAAPI[Q&A API]
        IntegrationAPI[Integration API]
        AuthAPI[Auth API]
    end

    subgraph "Service Layer"
        GitHubService[GitHub Service]
        EmbeddingService[Embedding Service]
        SummaryService[Summary Service]
        OAuthService[OAuth Service]
        SearchService[Unified Search]
    end

    subgraph "External APIs"
        GitHub[GitHub API]
        Google[Google Drive API]
        Slack[Slack API]
        JIRA[JIRA API]
        Gemini[Gemini AI]
    end

    subgraph "Database Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(Neon PostgreSQL)]
        VectorExt[Vector Extensions]
    end

    Auth --> AuthAPI
    Project --> ProjectAPI
    Search --> SearchAPI
    QnA --> QnAAPI
    Integrations --> IntegrationAPI
    Commits --> ProjectAPI

    ProjectAPI --> GitHubService
    SearchAPI --> EmbeddingService
    QnAAPI --> SummaryService
    IntegrationAPI --> OAuthService
    AuthAPI --> OAuthService

    GitHubService --> GitHub
    EmbeddingService --> Gemini
    SummaryService --> Gemini
    OAuthService --> Google
    OAuthService --> Slack
    OAuthService --> JIRA
    SearchService --> Google
    SearchService --> Slack
    SearchService --> JIRA

    GitHubService --> Prisma
    EmbeddingService --> Prisma
    SummaryService --> Prisma
    OAuthService --> Prisma
    SearchService --> Prisma

    Prisma --> PostgreSQL
    PostgreSQL --> VectorExt
```

## 🔄 Data Flow Diagrams

### GitHub Repository Indexing Flow

```mermaid
flowchart TD
    A[User Creates Project] --> B[Validate GitHub URL]
    B --> C[Fetch Repository Files]
    C --> D[Generate Code Embeddings]
    D --> E[Create AI Summaries]
    E --> F[Store in PostgreSQL]
    F --> G[Fetch Commit History]
    G --> H[Summarize Commits]
    H --> I[Store Commit Data]
    I --> J[Update Project Status]
    J --> K[Indexing Complete]

    C --> L{Error Handling}
    L --> M[Rate Limit Error]
    L --> N[Invalid Repository]
    L --> O[Network Error]
    M --> P[Retry with Backoff]
    N --> Q[User Notification]
    O --> R[Connection Retry]
```

### Multi-Source Search Flow

```mermaid
flowchart TD
    A[User Search Query] --> B[Check Connected Sources]
    B --> C{Google Drive Connected?}
    C -->|Yes| D[Search Google Drive]
    C -->|No| E[Skip Google Drive]
    B --> F{Slack Connected?}
    F -->|Yes| G[Search Slack]
    F -->|No| H[Skip Slack]
    B --> I{JIRA Connected?}
    I -->|Yes| J[Search JIRA]
    I -->|No| K[Skip JIRA]

    D --> L[Normalize Results]
    G --> L
    J --> L
    E --> L
    H --> L
    K --> L

    L --> M[Rank by Relevance]
    M --> N[Combine Results]
    N --> O[Return to User]
```

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    User {
        string id PK
        string emailAddress UK
        string firstName
        string lastName
        string imageUrl
        int credits
        datetime createdAt
        datetime updatedAt
    }

    Project {
        string id PK
        string name
        string githubUrl
        enum indexingStatus
        datetime createdAt
        datetime updatedAt
    }

    UserToProject {
        string id PK
        string userId FK
        string projectId FK
        datetime createdAt
        datetime updatedAt
    }

    SourceCodeEmbedding {
        string id PK
        vector summaryEmbedding
        text sourceCode
        string fileName
        text summary
        string projectId FK
    }

    Question {
        string id PK
        text question
        text answer
        json fileReferences
        string projectId FK
        string userId FK
    }

    Commit {
        string id PK
        string commitHash
        text commitMessage
        string commitAuthorName
        string commitAuthorAvatar
        datetime commitDate
        text summary
        string projectId FK
    }

    IntegrationAccount {
        string id PK
        string userId FK
        string typeId FK
        text accessToken
        text refreshToken
        datetime expiresAt
        json metadata
    }

    User ||--o{ UserToProject : "has"
    Project ||--o{ UserToProject : "belongs to"
    Project ||--o{ SourceCodeEmbedding : "contains"
    Project ||--o{ Question : "has"
    Project ||--o{ Commit : "has"
    User ||--o{ Question : "asks"
    User ||--o{ IntegrationAccount : "has"
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        Clerk[Clerk Auth]
        OAuth[OAuth 2.0]
        JWT[JWT Tokens]
    end

    subgraph "API Security"
        RateLimit[Rate Limiting]
        CORS[CORS Policy]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
    end

    subgraph "Data Security"
        Encryption[Data Encryption]
        TokenStorage[Secure Token Storage]
        AccessControl[Access Control]
    end

    subgraph "External Security"
        HTTPS[HTTPS Only]
        OAuthScopes[OAuth Scopes]
        APIKeys[API Key Management]
    end

    Clerk --> JWT
    OAuth --> JWT
    JWT --> RateLimit
    RateLimit --> CORS
    CORS --> Validation
    Validation --> Sanitization
    Sanitization --> Encryption
    Encryption --> TokenStorage
    TokenStorage --> AccessControl
    AccessControl --> HTTPS
    HTTPS --> OAuthScopes
    OAuthScopes --> APIKeys
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Frontend Deployment"
        NextJS[Next.js App]
        Vercel[Vercel Platform]
        CDN[CDN Distribution]
    end

    subgraph "Backend Services"
        API[API Routes]
        Server[Express Server]
        Prisma[Prisma Client]
    end

    subgraph "Database"
        Neon[Neon PostgreSQL]
        VectorDB[Vector Extensions]
        Backup[Automated Backups]
    end

    subgraph "External Services"
        Clerk[Clerk Auth]
        GitHub[GitHub API]
        Google[Google APIs]
        Slack[Slack API]
        JIRA[JIRA API]
        Gemini[Gemini AI]
    end

    NextJS --> Vercel
    Vercel --> CDN
    API --> Server
    Server --> Prisma
    Prisma --> Neon
    Neon --> VectorDB
    Neon --> Backup

    API --> Clerk
    API --> GitHub
    API --> Google
    API --> Slack
    API --> JIRA
    API --> Gemini
```

## 📈 Performance & Scalability

```mermaid
graph TB
    subgraph "Performance Optimizations"
        Caching[Response Caching]
        CDN[CDN Distribution]
        Compression[Gzip Compression]
        LazyLoading[Lazy Loading]
    end

    subgraph "Scalability Features"
        ConnectionPool[Database Connection Pool]
        RateLimiting[API Rate Limiting]
        BackgroundJobs[Background Processing]
        VectorIndexing[Vector Indexing]
    end

    subgraph "Monitoring"
        Logging[Structured Logging]
        Metrics[Performance Metrics]
        ErrorTracking[Error Tracking]
        HealthChecks[Health Checks]
    end

    Caching --> CDN
    CDN --> Compression
    Compression --> LazyLoading
    LazyLoading --> ConnectionPool
    ConnectionPool --> RateLimiting
    RateLimiting --> BackgroundJobs
    BackgroundJobs --> VectorIndexing
    VectorIndexing --> Logging
    Logging --> Metrics
    Metrics --> ErrorTracking
    ErrorTracking --> HealthChecks
```

This comprehensive system diagram shows the complete architecture of your AI Docs platform, covering both the GitHub integration feature and the multi-source knowledge integration system. The diagrams illustrate data flow, component relationships, security measures, and deployment architecture.
