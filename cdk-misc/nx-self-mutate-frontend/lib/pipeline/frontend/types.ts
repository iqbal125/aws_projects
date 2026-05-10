import type * as codebuild from 'aws-cdk-lib/aws-codebuild';
import type * as cdk from 'aws-cdk-lib';
import type * as pipelines from 'aws-cdk-lib/pipelines';
import type { EnvironmentName } from '../../config/environment';

export interface FrontendPipelineStageProps {
  pipeline: pipelines.CodePipeline;
  source: pipelines.IFileSetProducer;
  node22BuildSpec: codebuild.BuildSpec;
  environmentName: EnvironmentName;
  viteApiUrl: string;
  nxAffectedCompareBranch: string;
  forceFrontendDeploy?: boolean;
  env?: cdk.Environment;
  pre?: pipelines.Step[];
}
