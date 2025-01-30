FROM denoland/deno:alpine

WORKDIR /app

COPY . .

RUN deno install --entrypoint main.ts

ENTRYPOINT [ "deno", "run", "-A", "--unstable-cron", "main.ts" ]