# GitHub Actions Self-Hosted Runner in Docker

This directory contains everything needed to run a GitHub Actions self-hosted runner in a Docker container.

## Setup Instructions

### 1. Get a Runner Token

Go to your repository settings to get a new runner token:
https://github.com/MaxOpperman/spelwijsheid/settings/actions/runners/new

Copy the token from the configuration command.

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your `GITHUB_RUNNER_TOKEN`.

### 3. Get Docker Group ID

On Linux/Mac, find your Docker group ID:

```bash
getent group docker | cut -d: -f3
```

Update `DOCKER_GID` in `.env` with this value.

On Windows with Docker Desktop, you can use `999` (default).

### 4. Build and Start the Runner

```bash
docker-compose up -d
```

### 5. View Logs

```bash
docker-compose logs -f
```

### 6. Stop the Runner

```bash
docker-compose down
```

## How It Works

- The runner runs inside a Docker container
- It has access to the host's Docker daemon via the mounted Docker socket
- This allows it to build and run containers on your machine
- The workflow uses `runs-on: self-hosted` to target this runner
- No ports need to be opened on your router

## Updating the Runner

To update to a new runner version:

1. Update `RUNNER_VERSION` in `Dockerfile`
2. Rebuild: `docker-compose up -d --build`

## Troubleshooting

**Runner not appearing in GitHub:**

- Check logs: `docker-compose logs`
- Verify your token is correct and not expired
- Get a new token from GitHub if needed

**Docker permission errors:**

- Ensure `DOCKER_GID` matches your host's Docker group
- Check that Docker socket is accessible: `ls -la /var/run/docker.sock`

**Runner keeps restarting:**

- Token might be expired - get a new one
- Check logs for specific errors
