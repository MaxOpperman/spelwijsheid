# Scripts

## download-wordlist.js

Downloads the locale-specific word lists used by the games and solvers.

The script runs automatically during `npm install` (via the `preinstall` script) and can also be run manually:

```bash
npm run download:wordlist
```

It writes the following files into `static/` (all excluded from git — see `.gitignore`):

| Locale  | Source                                                                                  | Output                      |
| ------- | --------------------------------------------------------------------------------------- | --------------------------- |
| `nl-NL` | [OpenTaal/opentaal-wordlist](https://github.com/OpenTaal/opentaal-wordlist)             | `static/wordlist-nl-nl.txt` |
| `en-US` | [wooorm/dictionaries](https://github.com/wooorm/dictionaries) (`en`) Hunspell `.dic`    | `static/wordlist-en-us.txt` |
| `en-GB` | [wooorm/dictionaries](https://github.com/wooorm/dictionaries) (`en-GB`) Hunspell `.dic` | `static/wordlist-en-gb.txt` |

The English dictionaries are parsed from the Hunspell `.dic` format (affix data stripped) down to unique lowercase alphabetic words.

### OpenTaal Wordlist

The OpenTaal wordlist contains over 400,000 Dutch words and has received the Quality Mark Spelling (Keurmerk Spelling) from the Dutch Language Union (Taalunie). It's licensed under BSD/CC-BY and is free to use with proper attribution.

For more information, visit: https://github.com/OpenTaal/opentaal-wordlist

## download-geoip.js

Downloads the MaxMind [GeoLite2-City](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) database so the server can resolve approximate locations for opt-in analytics. It runs at container startup (see the `Dockerfile` `CMD`) and can be run manually:

```bash
npm run download:geoip
```

Configuration comes from the environment:

| Variable              | Default                         | Description                             |
| --------------------- | ------------------------------- | --------------------------------------- |
| `MAXMIND_ACCOUNT_ID`  | –                               | MaxMind account ID.                     |
| `MAXMIND_LICENSE_KEY` | –                               | MaxMind license key.                    |
| `GEOIP_DB_PATH`       | `/app/geoip/GeoLite2-City.mmdb` | Where the extracted `.mmdb` is written. |

The script is safe to run unconditionally: it exits successfully without doing anything when the credentials are missing (geolocation simply stays disabled) or when the existing database is still fresh (less than 7 days old). The `.tar.gz` is gunzipped and the `.mmdb` extracted in pure Node — no external tar dependency.

## migrate.js

Applies the Drizzle SQL migrations in `./drizzle` against `DATABASE_URL`. It runs at container startup before the app boots (see the `Dockerfile` `CMD`) and can also be run manually via the Drizzle Kit wrapper:

```bash
npm run db:migrate
```

`DATABASE_URL` must be set; the script exits with an error if it is missing.
