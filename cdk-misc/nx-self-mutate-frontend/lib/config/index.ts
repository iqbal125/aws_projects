import * as cdk from 'aws-cdk-lib';
import { getAppContext } from './app-context';
import { getDefaultAwsEnvironment } from './aws-environment';
import { environmentNameSchema } from './environment';
import { getFrontendPipelineConfig, type PipelineConfig } from './pipeline';

export type { GithubConfig } from './app-context';
export type { EnvironmentName } from './environment';
export type { PipelineConfig, PipelineProps } from './pipeline';

export interface EnvironmentConfig {
  frontendPipelineConfig: PipelineConfig;
}

export function getEnvironmentConfig(app: cdk.App): EnvironmentConfig {
  const currentEnv = environmentNameSchema.parse(app.node.tryGetContext('env'));
  const appContext = getAppContext(app);
  const env = getDefaultAwsEnvironment();

  return {
    frontendPipelineConfig: getFrontendPipelineConfig(
      currentEnv,
      appContext.github,
      appContext.environments[currentEnv],
      env
    ),
  };
}
