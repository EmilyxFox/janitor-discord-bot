# Contibuting

## 1. Download Deno

[Click here](https://deno.com/) for install instructions

## 2. Clone the repo

```shell
git clone https://github.com/EmilyxFox/brothel-discord-bot.git
```

## 3. Cache dependencies

```shell
deno install
```

## 4. Get a bot token

### 4.1

Go to [the Discord Developer portal](https://discord.com/developers/applications) and make a new application.

### 4.2

Create a bot account for the application under the "Bot" tab

### 4.3

Reset the token and put it in a .env file.

## 5. Run the bot

```shell
deno run --env-file -A --watch main.ts
```
