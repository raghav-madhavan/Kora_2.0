# `@kora/ui`

Shared UI component library for Kora apps. Built on React with TypeScript.

## Status

Early scaffold — `apps/web` currently uses local Tailwind components. Shared primitives (`Button`, `Card`, `Code`) live here for future extraction into shadcn/ui.

## Usage

```tsx
import { Button, Card } from "@kora/ui";
```

## Development

```bash
# from repo root
npm run build --filter=@kora/ui
```

Components are in `src/`. A legacy Turborepo starter copy also exists under `ui/` and will be consolidated.
