FROM oven/bun

WORKDIR /app
EXPOSE 3000

COPY ./src ./src
COPY package.json .
COPY bun.lock .
COPY build.ts .
COPY ./migrations ./migrations
COPY ./.flowbite-react ./.flowbite-react

RUN touch sqlite.db
RUN chown -R bun:bun /app && chmod -R ug+rw /app

USER bun
RUN bun install
RUN bun run build

CMD ["bun", "start"]
