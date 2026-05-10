# CDK infrastructure (`cdk-infra`)

This CDK app deploys **CDK-managed infrastructure**: a **self-mutating CodePipeline** per environment that pulls from GitHub via **CodeStar Connections** (SSM-backed ARN), deploys **frontend hosting** (`Frontend-<env>-FrontendStack`: S3 + CloudFront), then runs a **`PublishFrontendAssets`** CodeBuild step that builds the Vite app and syncs to the bucket. Bucket name and distribution id are injected into that step via **CodePipeline variables from CloudFormation outputs** on the frontend stack (no SSM intermediary). The publish step’s IAM grants broad **S3** and **CloudFront invalidation** permissions (narrowing beyond the pipeline stack boundary would require extra stacks).

Context is validated with Zod (`github` + per-environment **`name`** and **`frontend`** / `VITE_API_URL` from `@org/frontend-config`). Configure those values in [`cdk.json`](cdk.json).

## CDK default environment (`context.env`)

The **`context.env`** field in [`cdk.json`](cdk.json) (`dev` \| `qa` \| `prod`) is **default CDK context** for any `cdk` command **unless** you override with **`-c env=...`**. The entry point uses it to pick **`context.app.environments[env]`** (for example **`frontend.VITE_API_URL`**) and which stack is synthesized—for example **`FrontendPipelineStack-prod`** vs **`FrontendPipelineStack-dev`**.

**Why it lives in the repo:** so **`cdk synth`** / **`deploy`** without extra flags still targets a single, explicit environment. Many teams keep **`dev`** there to reduce the chance of an accidental production deploy from a laptop; others default to **`prod`** only if everyone always passes **`-c`** when it matters.

**Pipeline / CI:** The in-pipeline **Synth** CodeBuild step runs **`cdk synth -c env=<pipelineEnv>`** (see **`lib/pipeline/pipeline-definition.ts`**). So synthesis **inside AWS** uses the pipeline’s environment and **does not depend** on **`context.env`** in `cdk.json`.

**Local and root scripts:** **`pnpm run cdk-infra:synth`** and **`pnpm run cdk-infra:deploy`** without **`-c`** follow **`context.env`**. **`pnpm run cdk-infra:ci:synth`** passes **`-c env=dev`** explicitly, so it **does not** use the JSON default for **`env`**.

## Scripts (repository root [`package.json`](../../package.json))

| Script | Purpose |
|------|---------|
| `pnpm run cdk-infra:tsc` | **`tsc`** in this package only. |
| `pnpm run cdk-infra:build` | **`nx run @org/frontend-config:build`**, then **`cdk-infra:tsc`**. Run before **`cdk-infra:synth`** when infra sources or **`@org/frontend-config`** change. |
| `pnpm run cdk-infra:synth` / `diff` / `deploy` / `destroy` | Wrapper **`cdk`** CLI for this app (**`--require-approval never`** on deploy/destroy). |
| `pnpm run cdk-infra:ci:synth` | **`pnpm install --frozen-lockfile` → `nx sync` → `cdk-infra:build` → `cdk synth -c env=dev`** (mirrors the pipeline Synth step). |

## Quick commands from here

| Task | Command |
|------|---------|
| Compile only this package after deps are built | `pnpm --filter cdk-infra run build` (runs **`tsc`**) |
| Synth (default `context.env` in `cdk.json`) | `pnpm run cdk-infra:synth` (from repo root). |
| Synth specific env | `pnpm --filter cdk-infra exec cdk synth -c env=prod` |
| Deploy pipeline stack explicitly | `pnpm --filter cdk-infra exec cdk deploy --require-approval never -c env=dev FrontendPipelineStack-dev` |

Pipeline CodeBuild **synth** runs **`pnpm install --frozen-lockfile`**, **`pnpm exec nx sync`**, **`pnpm run cdk-infra:build`**, then **`pnpm --filter cdk-infra exec cdk synth -c env=<env>`**. The step sets **`CI=true`** and **`NX_DAEMON=false`** so Nx behaves on ephemeral agents. Artifacts are collected from **`infra/cdk-infra/cdk.out`** (repo-relative path).

### Troubleshooting: `cdk-infra:build` fails in CodeBuild; `cdk.out` missing

If **Synth** fails on **`pnpm run cdk-infra:build`**, **`cdk synth` never runs**, so **`infra/cdk-infra/cdk.out` does not exist** and artifact upload errors (for example *no matching base directory path*). Open the **Synth** build logs for the first failing command (often **`nx run @org/frontend-config:build`**). Run **`pnpm exec nx sync`** locally, commit any TypeScript project-reference updates it makes, and retry **`pnpm run cdk-infra:ci:synth`** to reproduce the pipeline sequence.

Bootstrap (once per account/region):

```sh
pnpm --filter cdk-infra exec cdk bootstrap aws://${AWS_DEFAULT_ACCOUNT}/${AWS_DEFAULT_REGION}
```

Set `AWS_DEFAULT_ACCOUNT` and `AWS_DEFAULT_REGION` (or `CDK_*`) when synthesizing locally.

For GitHub connection setup, store the CodeStar connection ARN in SSM at `context.app.github.connectionArnParameterName` from [`cdk.json`](cdk.json).
