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
FROM cgr.dev/chainguard/node
WORKDIR /app
ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1
COPY ./public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
ENV HOSTNAME=0.0.0.0
USER node
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD [ "server.js" ]
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

See [this](./workflow.md) page.