import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface GetItemsLambdaProps {
    cluster: rds.DatabaseCluster;
    secret: secretsmanager.Secret;

}

export class GetItemsLambda extends Construct {
    public readonly function: lambdaNodejs.NodejsFunction;
    public readonly alias: lambda.Alias;

    constructor(scope: Construct, id: string, props: GetItemsLambdaProps) {
        super(scope, id);

        this.function = new lambdaNodejs.NodejsFunction(this, 'GetItemsFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, 'handler.ts'),
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            description: 'Get all items Lambda function',
            bundling: {
                externalModules: [],
            },
            environment: {
                DB_SECRET_ARN: props.secret.secretArn,
                DB_CLUSTER_ARN: props.cluster.clusterArn,
                DB_NAME: 'itemsdb',
                POWERTOOLS_SERVICE_NAME: 'GetItemsService',
                POWERTOOLS_METRICS_NAMESPACE: 'ItemsAPI',
                POWERTOOLS_LOG_LEVEL: 'INFO',
                POWERTOOLS_LOGGER_SAMPLE_RATE: '0.01',
                POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'true',
                POWERTOOLS_TRACER_CAPTURE_ERROR: 'true',
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
            },
            tracing: lambda.Tracing.ACTIVE
        });

        // Create alias for the function
        this.alias = new lambda.Alias(this, 'GetItemsAlias', {
            aliasName: 'live',
            version: this.function.currentVersion,
            description: 'Live alias for GetItems function'
        });

        // Grant permissions to read database secret
        props.secret.grantRead(this.function);

        // Grant permissions to use RDS Data API
        this.function.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'rds-data:ExecuteStatement',
                'rds-data:BatchExecuteStatement',
                'rds-data:BeginTransaction',
                'rds-data:CommitTransaction',
                'rds-data:RollbackTransaction'
            ],
            resources: [props.cluster.clusterArn]
        }));
    }
}