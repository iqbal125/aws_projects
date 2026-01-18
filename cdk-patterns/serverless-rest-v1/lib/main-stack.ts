import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from './constructs/vpc';
import { SecretsConstruct } from './constructs/rds/secrets';
import { DatabaseConstruct } from './constructs/rds/rds-database';
import { DynamoDBTableConstruct } from './constructs/dynamodb/dynamodb-table';
import { LambdaFunctionsConstruct } from './constructs/rds/rds-lambda-functions';
import { DynamoLambdaFunctionsConstruct } from './constructs/dynamodb/dynamo-lamdba-funcs';
import { ApiGatewayConstruct } from './constructs/api-gateway';

/**
 * Serverless REST API Stack
 * A complete serverless CRUD API using AWS Lambda, Aurora PostgreSQL, and API Gateway
 */
export class ServerlessRestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC for database and Lambda functions
        const vpc = new VpcConstruct(this, 'Vpc');

        // Create database credentials secret
        const secrets = new SecretsConstruct(this, 'Secrets');

        // Create database resources (Aurora PostgreSQL)
        const database = new DatabaseConstruct(this, 'Database', {
            vpc: vpc.vpc,
            secret: secrets.secret
        });

        // Create DynamoDB table
        const dynamoTable = new DynamoDBTableConstruct(this, 'DynamoDBTable');

        // Create Lambda functions
        const lambdaFunctions = new LambdaFunctionsConstruct(this, 'LambdaFunctions', {
            cluster: database.cluster,
            secret: secrets.secret,
            dynamoTable: dynamoTable.table,
        });

        const dynamoLambdaFunctions = new DynamoLambdaFunctionsConstruct(this, 'DynamoLambdaFunctions', {
            dynamoTable: dynamoTable.table,
        });


        // Create API Gateway
        const apiGateway = new ApiGatewayConstruct(this, 'ApiGateway', {
            lambdaFunctions: lambdaFunctions,
            dynamoFunctions: dynamoLambdaFunctions
        });

        // Output important information
        new cdk.CfnOutput(this, 'VpcId', {
            value: vpc.vpc.vpcId,
            description: 'VPC ID'
        });

        new cdk.CfnOutput(this, 'DatabaseClusterEndpoint', {
            value: database.cluster.clusterEndpoint.hostname,
            description: 'Aurora PostgreSQL cluster endpoint'
        });


        new cdk.CfnOutput(this, 'ApiGatewayUrl', {
            value: apiGateway.api.url,
            description: 'REST API Gateway URL'
        });

    }
}