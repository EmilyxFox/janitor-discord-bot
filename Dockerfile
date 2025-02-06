FROM denoland/deno:alpine

WORKDIR /app

COPY . .

RUN mkdir logs

HEALTHCHECK --interval=1s --timeout=1s --start-period=3s --retries=3 \
  CMD curl -f http://localhost:8080/healthcheck || exit 1


RUN deno install --entrypoint main.ts

ENTRYPOINT [ "deno", "run", "-A", "--unstable-cron", "main.ts" ]