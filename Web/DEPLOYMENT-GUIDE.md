# 🐳 Docker Deployment Guide

This guide covers multiple ways to deploy your containerized Next.js application.

## 🚀 Quick Start Options

### 1. Local Development

```bash
# Using Docker Compose (Recommended)
docker-compose up --build

# Using Docker directly
docker build -t ai-docs-frontend .
docker run -p 3000:3000 --env-file .env.local ai-docs-frontend
```

### 2. Production Server (VPS/Dedicated)

```bash
# Using deployment script
./scripts/deploy.sh production

# Manual deployment
docker build -t ai-docs-frontend:prod .
docker run -d --name ai-docs-app -p 80:3000 --restart unless-stopped ai-docs-frontend:prod
```

## ☁️ Cloud Platform Deployments

### Railway (Easiest - Recommended)

1. **Connect GitHub**: Go to [Railway.app](https://railway.app) and connect your GitHub repo
2. **Auto-deploy**: Railway will detect the `railway.json` and deploy automatically
3. **Environment Variables**: Add your env vars in Railway dashboard
4. **Custom Domain**: Configure in Railway settings

**Railway will automatically:**

- Build from Dockerfile
- Deploy on every push to main
- Provide HTTPS
- Handle scaling

### Render

1. **Create Service**: Go to [Render.com](https://render.com) and create a new Web Service
2. **Connect Repo**: Link your GitHub repository
3. **Configure**:
   - Environment: Docker
   - Dockerfile Path: `./Dockerfile`
   - Health Check Path: `/api/health`
4. **Deploy**: Render will use the `render.yaml` configuration

### DigitalOcean App Platform

1. **Create App**: Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. **Source**: Connect GitHub repository
3. **Configure**:
   - Type: Docker
   - Dockerfile: `./Dockerfile`
   - Port: 3000
4. **Deploy**: DigitalOcean will build and deploy automatically

### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t ai-docs-frontend .
docker tag ai-docs-frontend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/ai-docs-frontend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/ai-docs-frontend:latest

# Create ECS service with the pushed image
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/ai-docs-frontend

# Deploy to Cloud Run
gcloud run deploy ai-docs-frontend --image gcr.io/PROJECT-ID/ai-docs-frontend --platform managed --region us-central1 --allow-unauthenticated
```

## 🔧 Environment Setup

### Required Environment Variables

Create these files based on your environment:

**`.env.local`** (Development):

```bash
NODE_ENV=development
DATABASE_URL="your_dev_database_url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
CLERK_SECRET_KEY="your_clerk_secret"
# ... other variables
```

**`.env.production`** (Production):

```bash
NODE_ENV=production
DATABASE_URL="your_prod_database_url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
CLERK_SECRET_KEY="your_clerk_secret"
# ... other variables
```

## 📋 Deployment Checklist

### Before Deployment:

- [ ] Environment variables configured
- [ ] Database migrations run (if needed)
- [ ] Prisma client generated
- [ ] Health check endpoint working
- [ ] Docker image builds successfully

### After Deployment:

- [ ] Health check passes: `curl https://your-domain.com/api/health`
- [ ] Application loads correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] All features functional

## 🛠️ Troubleshooting

### Common Issues:

**1. Build Failures:**

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t ai-docs-frontend .
```

**2. Environment Variables:**

```bash
# Check if env vars are loaded
docker exec -it container_name env
```

**3. Database Connection:**

```bash
# Test database connection
docker exec -it container_name npx prisma db push
```

**4. Port Issues:**

```bash
# Check if port is exposed
docker port container_name
```

### Logs and Debugging:

```bash
# View container logs
docker logs container_name

# Follow logs in real-time
docker logs -f container_name

# Execute commands in container
docker exec -it container_name /bin/sh
```

## 🔄 CI/CD with GitHub Actions

The included `.github/workflows/docker-deploy.yml` provides:

- Automatic builds on push/PR
- Docker image caching
- Multi-platform builds
- Automatic deployment to Railway

**Setup:**

1. Add secrets to GitHub repository:

   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `RAILWAY_TOKEN`

2. Push to main branch to trigger deployment

## 📊 Monitoring and Health Checks

### Health Check Endpoint

Your app includes a health check at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Monitoring Setup:

- **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
- **Logs**: Most platforms provide built-in log viewing
- **Metrics**: Consider adding application metrics with tools like Prometheus

## 💰 Cost Optimization

### Free Tier Options:

- **Railway**: $5/month credit, generous free tier
- **Render**: Free tier available
- **Vercel**: Free tier for personal projects
- **DigitalOcean**: $5/month droplets

### Production Recommendations:

- Use multi-stage Docker builds (already configured)
- Enable Docker layer caching
- Use CDN for static assets
- Implement proper logging and monitoring

## 🚀 Next Steps

1. **Choose your platform** (Railway recommended for simplicity)
2. **Set up environment variables**
3. **Deploy and test**
4. **Configure custom domain**
5. **Set up monitoring**

Your containerized app is now ready for production deployment! 🎉
