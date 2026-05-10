import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export interface DynamoGetLambdaProps {
    /**
     * The DynamoDB table to read from
     */
    table: dynamodb.Table;
}

export class DynamoGetLambda extends Construct {
    public readonly function: lambdaNodejs.NodejsFunction;
    public readonly alias: lambda.Alias;

    constructor(scope: Construct, id: string, props: DynamoGetLambdaProps) {
        super(scope, id);

        this.function = new lambdaNodejs.NodejsFunction(this, 'DynamoGetFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, 'handler.ts'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            description: 'DynamoDB Get endpoint Lambda function',
            environment: {
                TABLE_NAME: props.table.tableName,
            },
        });

        // Grant read permissions to the Lambda function
        props.table.grantReadData(this.function);

        // Create alias for the function
        this.alias = new lambda.Alias(this, 'DynamoGetAlias', {
            aliasName: 'live',
            version: this.function.currentVersion,
            description: 'Live alias for DynamoDB Get function'
        });
    }
}
