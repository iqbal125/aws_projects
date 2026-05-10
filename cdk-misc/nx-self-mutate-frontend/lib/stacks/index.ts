import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { EnvironmentStackProps } from '../config/environment';
import { Website } from './constructs/website';

export class FrontendStack extends cdk.Stack {
  public readonly assetsBucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly assetsBucketNameOutput: cdk.CfnOutput;
  public readonly distributionIdOutput: cdk.CfnOutput;
  public readonly distributionDomainNameOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentStackProps) {
    super(scope, id, props);

    const website = new Website(this, 'Website');

    this.assetsBucket = website.assetsBucket;
    this.distribution = website.distribution;

    this.assetsBucketNameOutput = new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
    });
    this.distributionIdOutput = new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
    });
    this.distributionDomainNameOutput = new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: `https://${this.distribution.distributionDomainName}`,
    });
  }
}
