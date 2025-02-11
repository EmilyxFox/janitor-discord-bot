# syntax=docker/dockerfile:1.7-labs
FROM denoland/deno:alpine-2.1.9 AS builder

WORKDIR /build

COPY ./exec /build/

RUN deno compile \
  --allow-env=NODE_V8_COVERAGE,UNDICI_NO_FG,JEST_WORKER_ID,WS_NO_BUFFER_UTIL,DISCORD_TOKEN \
  --allow-read=/deno-dir/node_modules,/node_modules,/tmp/node_modules \
  --allow-net=discord.com:443 \
  --output deregister-global-commands \
  deregister-global-commands.ts

FROM denoland/deno:alpine-2.1.9 AS prod

COPY --from=builder /build/deregister-global-commands /bin/

WORKDIR /app

RUN apk --no-cache add curl

HEALTHCHECK --interval=1s --timeout=1s --start-period=3s --retries=3 \
  CMD curl -sS -f http://localhost:8080/healthcheck || exit 1

RUN mkdir logs

COPY --exclude=/exec . .

RUN deno install --entrypoint main.ts

ENTRYPOINT [ "deno", "run", "-A", "--unstable-cron", "main.ts" ]