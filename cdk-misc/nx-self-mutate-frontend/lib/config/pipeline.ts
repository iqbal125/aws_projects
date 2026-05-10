import type * as cdk from 'aws-cdk-lib';
import type { EnvironmentContext, GithubConfig } from './app-context';
import type { EnvironmentName } from './environment';

export interface PipelineProps extends cdk.StackProps {
  environmentName: EnvironmentName;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  connectionArnParameterName: string;
  /** Passed to the Vite production build in the pipeline publish step. */
  viteApiUrl: string;
  /**
   * Branch to fetch as `origin/<branch>` for `nx affected` base ref (usually default/trunk).
   * @default githubBranch from CDK context
   */
  nxAffectedCompareBranch?: string;
  /** If true, skip affected logic and always build + deploy frontend assets. */
  forceFrontendDeploy?: boolean;
}

export interface PipelineConfig {
  stackName: string;
  props: PipelineProps;
}

export function getFrontendPipelineConfig(
  environmentName: EnvironmentName,
  github: GithubConfig,
  environmentContext: EnvironmentContext,
  env?: cdk.Environment
): PipelineConfig {
  return {
    stackName: `FrontendPipelineStack-${environmentName}`,
    props: {
      env,
      environmentName,
      githubOwner: github.owner,
      githubRepo: github.repo,
      githubBranch: github.branch,
      connectionArnParameterName: github.connectionArnParameterName,
      viteApiUrl: environmentContext.frontend.VITE_API_URL,
      nxAffectedCompareBranch: github.nxAffectedCompareBranch ?? github.branch,
      forceFrontendDeploy: github.forceFrontendDeploy ?? false,
    },
  };
}
