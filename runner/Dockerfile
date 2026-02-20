FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    sudo \
    git \
    jq \
    tar \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (to control host Docker via mounted socket)
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm get-docker.sh

# Create docker group with GID from environment variable
ARG DOCKER_GID
RUN groupadd -g ${DOCKER_GID} docker || true

# Create a user for the runner
RUN useradd -m -s /bin/bash runner && \
    usermod -aG sudo runner && \
    usermod -aG docker runner && \
    echo "runner ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set working directory
WORKDIR /home/runner

# Download and extract GitHub Actions runner
ARG RUNNER_VERSION
RUN curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    tar xzf actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    rm actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz && \
    mkdir -p /home/runner/_work && \
    chown -R runner:runner /home/runner

# Switch to runner user
USER runner

# Copy entrypoint script
COPY --chown=runner:runner entrypoint.sh /home/runner/entrypoint.sh
RUN chmod +x /home/runner/entrypoint.sh

ENTRYPOINT ["/home/runner/entrypoint.sh"]
