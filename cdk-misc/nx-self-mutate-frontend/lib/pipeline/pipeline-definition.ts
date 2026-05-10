import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import type { PipelineProps } from '../config/pipeline';
import {
  CDK_INFRA_CDK_OUT_DIRECTORY,
  NODE_22_PARTIAL_BUILD_SPEC,
  PIPELINE_COREPACK_ENABLE_COMMAND,
  PIPELINE_PNPM_INSTALL_COMMAND,
  pipelineCodeBuildEnvironment,
  pipelineNxCodeBuildEnvironmentVars,
  pipelinePnpmStoreCache,
} from './codebuild-defaults';

export class PipelineDefinition extends Construct {
  public readonly pipeline: pipelines.CodePipeline;
  public readonly source: pipelines.IFileSetProducer;
  public readonly node22BuildSpec = NODE_22_PARTIAL_BUILD_SPEC;

  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id);

    const connectionArn = ssm.StringParameter.valueForStringParameter(
      this,
      props.connectionArnParameterName
    );

    const nxEnv = pipelineNxCodeBuildEnvironmentVars();

    this.source = pipelines.CodePipelineSource.connection(
      `${props.githubOwner}/${props.githubRepo}`,
      props.githubBranch,
      {
        connectionArn,
        triggerOnPush: true,
      }
    );

    this.pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: `${id}-Pipeline`,
      crossAccountKeys: false,
      selfMutation: true,
      codeBuildDefaults: {
        cache: pipelinePnpmStoreCache(),
      },
      selfMutationCodeBuildDefaults: {
        buildEnvironment: {
          ...pipelineCodeBuildEnvironment(),
          environmentVariables: nxEnv,
        },
        partialBuildSpec: this.node22BuildSpec,
        cache: pipelinePnpmStoreCache(),
      },
      synth: new pipelines.CodeBuildStep('Synth', {
        input: this.source,
        primaryOutputDirectory: CDK_INFRA_CDK_OUT_DIRECTORY,
        buildEnvironment: {
          ...pipelineCodeBuildEnvironment(),
          environmentVariables: nxEnv,
        },
        partialBuildSpec: this.node22BuildSpec,
        commands: [
          PIPELINE_COREPACK_ENABLE_COMMAND,
          PIPELINE_PNPM_INSTALL_COMMAND,
          'pnpm exec nx sync',
          'pnpm run cdk-infra:build',
          `pnpm --filter cdk-infra exec cdk synth -c env=${props.environmentName}`,
        ],
      }),
    });
  }
}
