# Spelwijsheid

This app contains some games that I like to play and some that I was eager to program. Currently the games are:

- Wordle
- Spelwijze (Volkskrant App Game)

## Solvers

Because I am not always the best at finding the correct answer I have created some solvers as well for these games.

## Svelte

This app is programmed in Svelte to broaden my experience with frameworks. A small sidenote is that I took some shortcuts with Claude Sonnet 4 / 4.5 but who doesn't nowadays :D

## Deployment

### Docker Compose (Local)

The application runs on port 3000 by default. You can customize the host port in `docker-compose.yml` if needed.

```bash
docker-compose up -d
```

The app will be available at `http://localhost:3000`

### Self-Hosted with GitHub Actions

See the `runner/` directory for instructions on setting up a self-hosted GitHub Actions runner. You can customize the host port by setting the `HOST_PORT` GitHub repository secret in your repository settings.

## Future work

If you have ideas: add them to the Issues page.
