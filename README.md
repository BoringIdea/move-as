# MoveAS Monorepo

This repository aggregates the MoveAS frontend, backend, smart contracts, and SDK into a single workspace.

## Structure

- `apps/frontend`: Next.js application deployed on Vercel.
- `apps/backend`: NestJS service deployed on DigitalOcean.
- `packages/contracts`: Move smart contracts.
- `packages/sdk`: Node package published to npm.

## Getting Started

Install dependencies with your preferred workspace-aware package manager:

```bash
yarn install
```

Run the frontend locally:

```bash
yarn workspace moveas-website dev
```

Run the backend locally:

```bash
yarn workspace moveas-backend start:dev
```

Build all workspaces:

```bash
yarn build
```

