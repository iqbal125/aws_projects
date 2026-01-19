import { Construct } from 'constructs';
// import { VpcConstruct } from './constructs/vpc';
import { DynamoDBConstruct } from './constructs/dynamodb';
import { LambdaConstruct } from './constructs/lambda';
import { ApiGatewayConstruct } from './constructs/api-gateway';
import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib'


export class BasicApp extends Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    // Create VPC (optional for this setup, but kept for future use)
    // const vpc = new VpcConstruct(this, 'Vpc');

    // Create DynamoDB table
    const dynamodb = new DynamoDBConstruct(this, 'DynamoDB');

    // Create Lambda functions
    const lambdas = new LambdaConstruct(this, 'Lambda', {
      table: dynamodb.table
    });

    // Create API Gateway
    const api = new ApiGatewayConstruct(this, 'ApiGateway', {
      createFunction: lambdas.createFunction,
      getFunction: lambdas.getFunction,
      updateFunction: lambdas.updateFunction,
      deleteFunction: lambdas.deleteFunction,
      listFunction: lambdas.listFunction,
      seedFunction: lambdas.seedFunction
    });

    // Output API endpoint
    new CfnOutput(this, 'ApiUrl', {
      value: api.api.url,
      description: 'Todo API Gateway URL'
    });

    new CfnOutput(this, 'TableName', {
      value: dynamodb.table.tableName,
      description: 'DynamoDB Table Name'
    });
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