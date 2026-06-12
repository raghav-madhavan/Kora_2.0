# `@repo/typescript-config`

Shared TypeScript `extends` configs for the Kora monorepo.

## Configs

| File | Use case |
|---|---|
| `base.json` | Base compiler options |
| `nextjs.json` | Next.js apps |
| `react-library.json` | React component packages |

## Usage

In a `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["**/*.ts", "**/*.tsx", "next-env.d.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
