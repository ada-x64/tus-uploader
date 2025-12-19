FROM oven/bun

WORKDIR /app
RUN chown -R bun:bun .

COPY ./src ./src
COPY package.json .
COPY bun.lock .

USER bun
EXPOSE 3000

RUN bun install
RUN bun run build

CMD ["bun", "start"]
