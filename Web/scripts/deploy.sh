#!/bin/bash

# Docker Deployment Script
# Usage: ./scripts/deploy.sh [platform] [environment]

set -e

PLATFORM=${1:-"local"}
ENVIRONMENT=${2:-"production"}
IMAGE_NAME="ai-docs-frontend"
CONTAINER_NAME="ai-docs-app"

echo "🚀 Starting deployment to $PLATFORM ($ENVIRONMENT)..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$ENVIRONMENT .

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the new container
echo "🏃 Starting new container..."
case $PLATFORM in
  "local")
    docker run -d \
      --name $CONTAINER_NAME \
      -p 3000:3000 \
      --env-file .env.local \
      --restart unless-stopped \
      $IMAGE_NAME:$ENVIRONMENT
    ;;
  "production")
    docker run -d \
      --name $CONTAINER_NAME \
      -p 80:3000 \
      --env-file .env.production \
      --restart unless-stopped \
      $IMAGE_NAME:$ENVIRONMENT
    ;;
  "staging")
    docker run -d \
      --name $CONTAINER_NAME \
      -p 3001:3000 \
      --env-file .env.staging \
      --restart unless-stopped \
      $IMAGE_NAME:$ENVIRONMENT
    ;;
esac

# Health check
echo "🔍 Performing health check..."
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Deployment successful! App is running on http://localhost:3000"
else
  echo "❌ Health check failed. Check container logs:"
  docker logs $CONTAINER_NAME
  exit 1
fi

echo "🎉 Deployment completed successfully!"
