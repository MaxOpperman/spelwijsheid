# Docker Deployment Guide

This guide explains how to deploy Spelwijsheid to your own server using Docker and GitHub Actions.

## Prerequisites

1. A server with Docker installed
2. SSH access to your server
3. GitHub repository secrets configured

## Setup Instructions

### 1. Server Setup

On your server, ensure Docker is installed:

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- **`SERVER_HOST`**: Your server's IP address or domain name
- **`SERVER_USER`**: SSH username (e.g., `root` or your user)
- **`SERVER_SSH_KEY`**: Private SSH key for authentication
- **`SERVER_PASSWORD`**: Server password for authentication

**Note**: The deployment supports both SSH key and password authentication. You can use either one or both together for added security.

#### SSH Key Setup (Recommended)

To generate an SSH key for deployment:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server.com

# Copy the PRIVATE key content to GitHub Secrets (SERVER_SSH_KEY)
cat ~/.ssh/github_deploy
```

#### Password Setup

Simply add your server password to the `SERVER_PASSWORD` secret in GitHub. This can be used alone or in combination with the SSH key.

### 3. Make Container Registry Public (Optional)

If you want to make the container registry public:

1. Go to https://github.com/users/YOUR_USERNAME/packages
2. Find the `spelwijsheid` package
3. Click "Package settings"
4. Change visibility to "Public"

Or keep it private and the workflow will use GITHUB_TOKEN for authentication.

### 4. Deploy

Push to the `main` branch or manually trigger the workflow.

The GitHub Action will:

1. Build the Docker image
2. Push it to GitHub Container Registry (ghcr.io)
3. SSH into your server
4. Pull the latest image
5. Stop the old container
6. Start a new container

## Local Testing

Test the Docker build locally before deploying:

```bash
# Build the image
docker build -t spelwijsheid .

# Run the container
docker run -p 3000:6749 spelwijsheid

# Or use docker-compose
docker-compose up
```

Visit http://localhost:6749 to test.

## Troubleshooting

### Container logs

```bash
docker logs spelwijsheid
docker logs -f spelwijsheid  # Follow logs
```

### Restart container

```bash
docker restart spelwijsheid
```

### Rebuild and redeploy

```bash
docker stop spelwijsheid
docker rm spelwijsheid
docker pull ghcr.io/YOUR_USERNAME/spelwijsheid:latest
docker run -d --name spelwijsheid --restart unless-stopped -p 3000:6749 ghcr.io/YOUR_USERNAME/spelwijsheid:latest
```

### Check container status

```bash
docker ps
docker ps -a  # Show all containers including stopped ones
```

## Monitoring

Consider setting up monitoring:

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Container monitoring**: Portainer, Dockge
- **Server monitoring**: Netdata, Prometheus + Grafana

## Switching from GitHub Pages

To stop using GitHub Pages:

1. Deploy the Docker version and verify it works
2. Update DNS to point to your server
3. Disable GitHub Pages in repository settings
4. Delete or rename `.github/workflows/deploy.yml`

## Environment Variables

If you need environment variables, update the deployment script:

```yaml
docker run -d \
--name spelwijsheid \
--restart unless-stopped \
-p 3000:6749 \
-e NODE_ENV=production \
-e BASE_PATH="" \
ghcr.io/${{ github.repository_owner }}/spelwijsheid:latest
```

## Security Considerations

1. **Firewall**: Only expose necessary ports (80, 443, 22)
2. **SSH**: Use key-based authentication only, disable password auth
3. **Updates**: Keep Docker and the server OS updated
4. **SSL**: Always use HTTPS in production (Let's Encrypt is free)
5. **Secrets**: Never commit secrets to the repository

## Cost Comparison

- **GitHub Pages**: Free
- **Self-hosted server**:
  - VPS: $5-10/month (DigitalOcean, Linode, Hetzner)
  - Can host multiple apps on one server
  - Full control over infrastructure
