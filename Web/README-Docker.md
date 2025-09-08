# Docker Deployment Guide

This guide explains how to containerize and deploy your Next.js application using Docker.

## Files Created

- `Dockerfile` - Production Docker image
- `Dockerfile.dev` - Development Docker image
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build context

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Production build
docker-compose up --build

# Development build
docker-compose --profile dev up --build frontend-dev
```

### 2. Build and Run with Docker directly

```bash
# Build the image
docker build -t ai-docs-frontend .

# Run the container
docker run -p 3000:3000 --env-file .env.local ai-docs-frontend
```

## Environment Variables

Make sure to create a `.env.local` file with all required environment variables:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the Next.js app and deploy it

### Option 2: Docker on Cloud Platforms

- **Railway**: Connect GitHub repo, Railway will auto-detect Docker
- **Render**: Use Docker deployment option
- **DigitalOcean App Platform**: Deploy from Dockerfile
- **AWS ECS/Fargate**: Use the Dockerfile for container deployment

### Option 3: Self-hosted VPS

```bash
# On your server
git clone <your-repo>
cd Web
docker-compose up -d
```

## Troubleshooting

### React 130 Error

The containerized approach should resolve React 130 errors by:

- Using a consistent Node.js environment
- Proper dependency management
- Isolated build environment

### Build Issues

If you encounter build issues:

1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker build --no-cache -t ai-docs-frontend .`
3. Check environment variables are properly set

### Performance Optimization

The Dockerfile uses multi-stage builds to:

- Minimize final image size
- Optimize build times
- Use Next.js standalone output for better performance

## Health Check

The container includes a health check endpoint. You can verify the app is running:

```bash
curl http://localhost:3000/api/health
```

## Production Considerations

1. **Security**: Use non-root user (already configured)
2. **Performance**: Uses Next.js standalone output
3. **Monitoring**: Health checks included
4. **Scaling**: Can be easily scaled with Docker Swarm or Kubernetes
