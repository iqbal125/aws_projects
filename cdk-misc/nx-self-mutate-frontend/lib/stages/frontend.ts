import * as cdk from 'aws-cdk-lib';
import type * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { EnvironmentStageProps } from '../config/environment';
import { FrontendStack } from '../stacks';

export class FrontendStage extends cdk.Stage {
  public readonly assetsBucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly assetsBucketNameOutput: cdk.CfnOutput;
  public readonly distributionIdOutput: cdk.CfnOutput;
  public readonly distributionDomainNameOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentStageProps) {
    super(scope, id, props);

    const frontendStack = new FrontendStack(this, 'FrontendStack', {
      env: props.env,
      environmentName: props.environmentName,
    });

    this.assetsBucket = frontendStack.assetsBucket;
    this.distribution = frontendStack.distribution;
    this.assetsBucketNameOutput = frontendStack.assetsBucketNameOutput;
    this.distributionIdOutput = frontendStack.distributionIdOutput;
    this.distributionDomainNameOutput = frontendStack.distributionDomainNameOutput;
  }
}
