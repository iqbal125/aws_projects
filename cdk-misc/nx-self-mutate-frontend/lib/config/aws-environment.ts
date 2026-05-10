import type * as cdk from 'aws-cdk-lib';

export function getDefaultAwsEnvironment(): cdk.Environment {
  return {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? process.env.AWS_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? process.env.AWS_DEFAULT_REGION,
  };
}
