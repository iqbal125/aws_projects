#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessRestStack } from './main-stack';

const app = new cdk.App();

new ServerlessRestStack(app, 'ServerlessRestStack', {
    // Environment configuration
    // Uncomment to deploy to specific account/region:
    // env: { 
    //   account: process.env.CDK_DEFAULT_ACCOUNT, 
    //   region: process.env.CDK_DEFAULT_REGION 
    // },
});