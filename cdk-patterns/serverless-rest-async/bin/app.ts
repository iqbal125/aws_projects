#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { ServerlessAsyncApp } from '../lib/index';

const app = new App();

new ServerlessAsyncApp(app, 'ServerlessAsyncApp', {
    // Environment configuration
    // Uncomment to deploy to specific account/region:
    // env: { 
    //   account: process.env.CDK_DEFAULT_ACCOUNT, 
    //   region: process.env.CDK_DEFAULT_REGION 
    // },
});
