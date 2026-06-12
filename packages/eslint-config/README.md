# `@repo/eslint-config`

Shared ESLint configurations for the Kora monorepo.

## Exports

| Import | Use case |
|---|---|
| `@repo/eslint-config/base` | Base TypeScript rules |
| `@repo/eslint-config/next-js` | Next.js apps (`apps/web`, `apps/admin`) |
| `@repo/eslint-config/react-internal` | Internal React libraries |

## Usage

In an app's `eslint.config.js`:

```js
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default nextJsConfig;
```

Consumed by `apps/web`, `apps/admin`, and `packages/ui`.
