import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import type { PipelineProps } from '../../config/pipeline';
import { PipelineDefinition } from '../pipeline-definition';
import { FrontendPipelineStage } from './pipeline-stage';

export class FrontendPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    const pipelineDefinition = new PipelineDefinition(this, 'PipelineDefinition', props);

    new FrontendPipelineStage(this, 'FrontendPipelineStage', {
      pipeline: pipelineDefinition.pipeline,
      source: pipelineDefinition.source,
      node22BuildSpec: pipelineDefinition.node22BuildSpec,
      environmentName: props.environmentName,
      viteApiUrl: props.viteApiUrl,
      nxAffectedCompareBranch: props.nxAffectedCompareBranch ?? props.githubBranch,
      forceFrontendDeploy: props.forceFrontendDeploy,
      env: props.env,
    });
  }
}
