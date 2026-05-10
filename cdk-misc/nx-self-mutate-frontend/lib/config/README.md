# `lib/config`

TypeScript helpers and Zod schemas for CDK app context, deployment targets, and pipeline props. The app entry (`bin/cdk-infra.ts`) uses **`getEnvironmentConfig`** from `index.ts` to read context and return **`EnvironmentConfig`**.

## Files

| File | Role |
|------|------|
| **`index.ts`** | **`EnvironmentConfig`** (`frontendPipelineConfig` only), **`getEnvironmentConfig(app)`**, and re-exports (`GithubConfig`, `EnvironmentName`, `PipelineConfig`, `PipelineProps`). |
| **`app-context.ts`** | Parses CDK context key **`app`**: GitHub metadata plus per-environment optional **`name`** and required **`frontend`** (Vite client env from `@org/frontend-config`). Defines **`getAppContext`**, **`GithubConfig`**, **`EnvironmentContext`**. |
| **`environment.ts`** | **`EnvironmentName`** as `dev` \| `qa` \| `prod` (Zod enum), plus **`EnvironmentProps`**, **`EnvironmentStageProps`**, and **`EnvironmentStackProps`**. |
| **`aws-environment.ts`** | **`getDefaultAwsEnvironment()`** — `{ account, region }` from `CDK_DEFAULT_*` / `AWS_DEFAULT_*`. |
| **`pipeline.ts`** | **`PipelineProps`**, **`PipelineConfig`**, **`getFrontendPipelineConfig`**. |

## Context shape

- **`env`** (top-level CDK context): `dev` \| `qa` \| `prod`.
- **`app`**: `github` plus **`environments.dev|qa|prod`** with optional **`name`** and **`frontend`** (`VITE_API_URL`, aligned with `@org/frontend-config`). See [`cdk.json`](../../cdk.json).
