<a id="readme-top"></a>

<div align="center">
    <h1>Janitor Bot</h1>
    <p>
      Eventually fully featured Discord Bot
      <br>
      <a href="#usage">Jump to Usage</a>
      <br>
      <br>
      <a href="#usage">Contributing</a>
      &middot;
      <a href="../../issues/new?labels=bug&template=bug-report.md">Report Bug</a>
      &middot;
      <a href="../../issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
    </p>
</div>

## About this project

This is a Discord bot for a private server. This project is set up to allow any member of the server to contribute features to the bot and learn about
development and DevOps together.

The bot is written in Typescript to be run on the Deno runtime.

### Built with

[![Deno](https://img.shields.io/badge/Deno-000?logo=deno&logoColor=fff)](https://deno.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white)](https://discord.gg/)
[![Bluesky](https://img.shields.io/badge/Bluesky-0285FF?logo=bluesky&logoColor=fff)](https://bsky.app/)

[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](/.github/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](/Dockerfile)
[![Visual Studio Code](https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=vsc&logoColor=white)](/.vscode/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](/.github/workflows/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Database
- [x] Logging
- [x] Image spoiler enforcement
- [ ] Reaction roles
  - [x] Set up database
- [ ] Automatic bulk message deletion
- [ ] Starboard
- [x] Button to remove automatic message replies
  - [ ] Permission system for it
- [ ] Let boosters set their own colour
- [ ] Server emoji popularity tracking

See the [open issues](../../issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Docker Compose

```yaml
services:
  bot:
    # You can pin the version by using a semver tag e.g.:
    # ghcr.io/emilyxfox/janitor-discord-bot:v0.3.1
    image: ghcr.io/emilyxfox/janitor-discord-bot:latest
    restart: unless-stopped
    # This example uses an external .env file.
    # The .env file will be read when you run docker compose up
    # Environment variables can be defined directly here as well
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN}
      # You can use the service name instead of an IP
      DB_URL: http://db:8080/
      # You can choose to deploy commands to a list of guilds or globally
      # The bot defaults to registering commands globally.
      # If you want to deploy commands to a list of guilds...
      DEPLOY_COMMANDS_TO: GUILDS
      # ...you should specify them with this list syntax.
      GUILDS: |-
        1327443723425363754
        1312443867846354378
    # Bind the /app/logs/ directory to persist logs between container restarts.
    volumes:
      - ./logs:/app/logs

  db:
    image: ghcr.io/tursodatabase/libsql-server:latest
    platform: linux/amd64
    restart: unless-stopped
    # Unless you need to access the DB from the host system
    # you don't need to bind any ports.
    # If you need this it might be a good idea to also configure auth.
    #ports:
    #  - "8080:8080"
    environment:
      - SQLD_NODE=primary
    volumes:
      - ./data/libsql:/var/lib/sqld
```

### Environment variables

| Environment Variable   | Description                                                                                                                | Required / Default                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **DISCORD_TOKEN**      | The Discord bot token used for authentication.                                                                             | **Required**                              |
| **DEPLOY_COMMANDS_TO** | Specifies the deployment target for commands. Accepts either `GLOBAL` or `GUILDS` (case insensitive).                      | **Optional**, defaults to `GLOBAL`        |
| **GUILDS**             | A newline-separated (`\n`) list of guild IDs where commands will be deployed (if `DEPLOY_COMMANDS_TO` is set to `GUILDS`). | **Optional** (no default)                 |
| **LOG_LEVEL**          | Sets the log level to either DEBUG or INFO                                                                                 | **Optional**, defaults to `DEBUG`         |
| **DB_URL**             | The URL for connecting to the database. Must be a valid URL.                                                               | **Required**                              |
| **DB_AUTH**            | Database authentication credentials (if needed).                                                                           | **Optional** (no default)                 |
| **DEV**                | Flag indicating development mode. Accepts `"true"` or `"false"` (case insensitive).                                        | **Optional**, defaults to `false`         |
| **REPO_URL**           | The URL of the repository.                                                                                                 | **Optional**, defaults to this repository |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contibuting

### Prerequisites

- [Deno](https://deno.com/)
  - Windows:
  ```powershell
  irm https://deno.land/install.ps1 | iex
  ```
  - Linux/Mac:
  ```shell
  curl -fsSL https://deno.land/install.sh | sh
  ```
- Discord bot token
  1. Go to the **[Discord Developer Portal](https://discord.dev/)** and sign in.
  2. Open the **[Applications](https://discord.com/developers/applications)** tab and create a new application.
  3. Enable "Presence Intent", "Server Members Intent", and "Message Content Intent" under **Privileged Gateway Intents**
  4. Reset the bot token.
- [Docker](https://www.docker.com/) for container development
  - Install instructions for your OS can be found in the [Docker documentation](https://docs.docker.com/get-started/get-docker/).

### Installation

1. Fork the repo

```shell
# Github CLI
gh repo fork EmilyxFox/janitor-discord-bot
```

2. Clone your fork

```shell
git clone https://github.com/{Your username}/janitor-discord-bot.git
```

3. Install dependencies

```shell
deno install
```

4. Make a copy of .env.example and fill the required variables

```shell
# Linux
cp ./.env.example ./.env
```

```powershell
# Windows
Copy-Item -Path ".\.env.example" -Destination ".\.env"
```

5. Run the bot

```shell
deno task dev
```

If it bot detects that it is not in any guilds it will output an invite link to the console.

### Making upstream contributions

1. Create a branch for your feature

```shell
git switch -c feat/my-cool-feature
```

2. Commit your changes

```shell
git commit -m "I added the coolest feature!"
```

3. Push your branch

```shell
git push origin feat/my-cool-feature
```

4. [Open a pull request](https://github.com/EmilyxFox/janitor-discord-bot/pulls)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
