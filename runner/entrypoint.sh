#!/bin/bash
set -e

# Check if runner is already configured
if [ ! -f ".runner" ]; then
    echo "Configuring GitHub Actions Runner..."
    
    # Configure the runner
    ./config.sh \
        --url "${GITHUB_REPOSITORY_URL}" \
        --token "${GITHUB_RUNNER_TOKEN}" \
        --name "${RUNNER_NAME}" \
        --work "${RUNNER_WORKDIR}" \
        --labels "${RUNNER_LABELS}" \
        --unattended \
        --replace
    
    echo "Runner configured successfully!"
else
    echo "Runner already configured, skipping configuration..."
fi

# Cleanup function
cleanup() {
    echo "Removing runner..."
    ./config.sh remove --token "${GITHUB_RUNNER_TOKEN}" || true
}

# Trap signals to cleanup
trap cleanup EXIT

# Start the runner
echo "Starting runner..."
./run.sh