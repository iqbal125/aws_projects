import * as cdk from 'aws-cdk-lib';
import type * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { Construct } from 'constructs';

export class Website extends Construct {
  public readonly assetsBucket: s3.IBucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucketRemoval = {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    };

    const website = new CloudFrontToS3(this, 'Resource', {
      bucketProps: bucketRemoval,
      loggingBucketProps: bucketRemoval,
      cloudFrontLoggingBucketProps: bucketRemoval,
      cloudFrontLoggingBucketAccessLogBucketProps: bucketRemoval,
      cloudFrontDistributionProps: {
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
        ],
      },
    });

    this.assetsBucket = website.s3BucketInterface;
    this.distribution = website.cloudFrontWebDistribution;
  }
}
