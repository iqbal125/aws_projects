import { Construct } from 'constructs';
import { VpcConstruct } from './constructs/vpc';
import { App, Stack, StackProps } from 'aws-cdk-lib'


export class BasicApp extends Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);


    const vpc = new VpcConstruct(this, 'Vpc');

  }
}

const app = new App()

new BasicApp(app, 'BasicApp', {
  // Environment configuration
  // Uncomment to deploy to specific account/region:
  // env: { 
  //   account: process.env.CDK_DEFAULT_ACCOUNT, 
  //   region: process.env.CDK_DEFAULT_REGION 
  // },
});