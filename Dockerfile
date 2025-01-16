FROM denoland/deno:alpine

WORKDIR /app

COPY . .

RUN deno install

CMD [ "run", "-A", "--unstable-cron", "main.ts" ]