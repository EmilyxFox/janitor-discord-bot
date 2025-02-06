FROM denoland/deno:alpine

WORKDIR /app

RUN apk --no-cache add curl

HEALTHCHECK --interval=1s --timeout=1s --start-period=3s --retries=3 \
  CMD curl -sS -f http://localhost:8080/healthcheck || exit 1

COPY . .

RUN mkdir logs



RUN deno install --entrypoint main.ts

ENTRYPOINT [ "deno", "run", "-A", "--unstable-cron", "main.ts" ]