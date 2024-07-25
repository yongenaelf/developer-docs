---
title: NextJS
description: NextJS
---

## Code changes

If you are using environment variables, please ensure that you do the following:

### Export variables in a function

```typescript title=utils/get-env.ts
import { unstable_noStore as noStore } from "next/cache";

export default function getEnv(key: string) {
  noStore();
  // cookies(), headers(), and other dynamic functions
  // will also opt into dynamic rendering, meaning
  // this env variable is evaluated at runtime
  const value = process.env[key];
  return value;
}
```

Then, elsewhere in your code:

```tsx title=app/page.tsx
import getEnv from "@/lib/get-env";

export default function Home() {
  const myDynamicVar = getEnv("HELLO_WORLD");

  return <>{myDynamicVar} will be runtime variable</>;
}
```

:::tip

As usual, in Client components, use `NEXT_PUBLIC_ENV_NAME` so that it will be visible to the frontend.

:::

:::note

Reference: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#runtime-environment-variables

:::

## Configuration

### next.config.js

```js "output: "standalone"," title=next.config.js
module.exports = {
  output: "standalone",
};
```

### Dockerfile

```dockerfile title=Dockerfile
FROM node:20-alpine AS base

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY ./public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --chown=nextjs:nodejs ./.next/standalone ./
COPY --chown=nextjs:nodejs ./.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
```

### .dockerignore

```txt title=.dockerignore
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
!.next/static
!.next/standalone
.git
```

:::note

Reference: https://github.com/vercel/next.js/tree/canary/examples/with-docker

:::

### GitHub Actions Workflow

```yml title=.github/workflows/main.yml
name: Node.js CI

on:
  workflow_dispatch:
  push:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "npm"
      - run: npm ci
      - run: npm run build

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKER_USERNAME }}/${{ github.event.repository.name }}
          tags: |
            type=sha
            # set latest tag for default branch
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          platforms: linux/amd64,linux/arm64
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```
