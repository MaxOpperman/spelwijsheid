# Spelwijsheid

This app contains some games that I like to play and some that I was eager to program. Currently the games are:

- Wordle
- Impossible Wordle (adverse choosing of words while you guess)
- Spelwijze (Volkskrant App Game)
- N-Queens (LinkedIn Game)
- Pinpoint (LinkedIn Game)

## Solvers

Because I am not always the best at finding the correct answer I have created some solvers as well for these games.

## Language Support

The app now supports multiple languages with locale-specific word lists:

- **Dutch (nl-NL)**: Uses the [OpenTaal wordlist](https://github.com/OpenTaal/opentaal-wordlist) with support for the Dutch 'ij' digraph
- **English (US & GB)**: Uses distinct dictionaries from [wooorm/dictionaries](https://github.com/wooorm/dictionaries) with regional spelling variations
  - **en-US**: American English spellings (e.g., "color")
  - **en-GB**: British English spellings (e.g., "colour")

Game state (progress, statistics, saved games) is maintained separately per locale, and the ij digraph handling is automatically disabled for English locales where it's not applicable.

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

### AI-powered games (Ollama)

Some games generate content at runtime by calling a local [Ollama](https://ollama.com) instance.

Configure the connection via environment variables (copy `.env.example` to `.env` on your runner):

| Variable         | Default                  | Description                      |
| ---------------- | ------------------------ | -------------------------------- |
| `OLLAMA_API_URL` | `http://localhost:11434` | Base URL of the Ollama API       |
| `OLLAMA_MODEL`   | `gpt-oss`                | Model name to use for generation |

**Session security** — the AI response (including any secret answer) is never serialised into the browser cookie. Instead, the server creates an in-memory session keyed by a random UUID; only the UUID is written to an `httpOnly` cookie. Sessions expire after 24 hours and are pruned lazily. See `src/routes/pinpoint/game-store.ts`.

**Fuzzy answer matching** — user input is compared against the correct answer using Levenshtein edit distance. Tolerance scales with answer length (0 for <= 4 chars, 1 for 5-7, 2 for 8+).

## Future work

If you have ideas: [create an issue](https://github.com/MaxOpperman/spelwijsheid/issues/new).
