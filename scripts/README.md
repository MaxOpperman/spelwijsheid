# Scripts

## download-wordlist.js

This script downloads the Dutch wordlist from [OpenTaal/opentaal-wordlist](https://github.com/OpenTaal/opentaal-wordlist) on GitHub.

The wordlist is automatically downloaded:
- During `npm install` (via the `postinstall` script)
- When running `npm run download-wordlist` manually

The wordlist is saved to `static/wordlist.txt` and is excluded from git (see `.gitignore`).

### OpenTaal Wordlist

The OpenTaal wordlist contains over 400,000 Dutch words and has received the Quality Mark Spelling (Keurmerk Spelling) from the Dutch Language Union (Taalunie). It's licensed under BSD/CC-BY and is free to use with proper attribution.

For more information, visit: https://github.com/OpenTaal/opentaal-wordlist
