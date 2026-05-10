import { clientEnvSchema } from '@org/frontend-config';
import * as cdk from 'aws-cdk-lib';
import { z } from 'zod';
import { environmentNameSchema } from './environment';

export const githubConfigSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().min(1),
  connectionArnParameterName: z.string().min(1),
  /** Base branch ref for nx affected (defaults to `branch`). */
  nxAffectedCompareBranch: z.string().min(1).optional(),
  /** When true, pipeline always builds and deploys frontend (skip nx affected for publish). */
  forceFrontendDeploy: z.boolean().optional(),
});

export type GithubConfig = z.infer<typeof githubConfigSchema>;

const environmentContextSchema = z.object({
  name: z.string().min(1).optional(),
  frontend: clientEnvSchema,
});

const appContextSchema = z.object({
  github: githubConfigSchema,
  environments: z.record(environmentNameSchema, environmentContextSchema),
});

export type AppContext = z.infer<typeof appContextSchema>;
export type EnvironmentContext = z.infer<typeof environmentContextSchema>;

export function getAppContext(app: cdk.App): AppContext {
  return appContextSchema.parse(app.node.tryGetContext('app'));
}
