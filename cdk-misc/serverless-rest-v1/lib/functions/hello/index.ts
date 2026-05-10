import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export interface HelloLambdaProps {
    // No additional props needed for TypeScript Lambda
}

export class HelloLambda extends Construct {
    public readonly function: lambdaNodejs.NodejsFunction;
    public readonly alias: lambda.Alias;

    constructor(scope: Construct, id: string, props?: HelloLambdaProps) {
        super(scope, id);

        this.function = new lambdaNodejs.NodejsFunction(this, 'HelloFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, 'handler.ts'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            description: 'Hello endpoint Lambda function',
        });

        // Create alias for the function
        this.alias = new lambda.Alias(this, 'HelloAlias', {
            aliasName: 'live',
            version: this.function.currentVersion,
            description: 'Live alias for Hello function'
        });
    }
}
