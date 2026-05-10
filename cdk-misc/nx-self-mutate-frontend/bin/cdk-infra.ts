#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getEnvironmentConfig } from '../lib/config';
import { FrontendPipelineStack } from '../lib/pipeline/frontend/pipeline-stack';

const app = new cdk.App();
const config = getEnvironmentConfig(app);

new FrontendPipelineStack(app, config.frontendPipelineConfig.stackName, config.frontendPipelineConfig.props);
