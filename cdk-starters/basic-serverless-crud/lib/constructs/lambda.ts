import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConstructProps {
    table: dynamodb.Table;
}

export class LambdaConstruct extends Construct {
    public readonly createFunction: lambda.Function;
    public readonly getFunction: lambda.Function;
    public readonly updateFunction: lambda.Function;
    public readonly deleteFunction: lambda.Function;
    public readonly listFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);

        const commonEnv = {
            TABLE_NAME: props.table.tableName,
        };

        const functionsPath = path.join(__dirname, '../functions');

        // Create Todo Lambda
        this.createFunction = new lambda.Function(this, 'CreateTodo', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'create.handler',
            code: lambda.Code.fromAsset(functionsPath),
            environment: commonEnv,
            timeout: Duration.seconds(30)
        });

        // Get Todo Lambda
        this.getFunction = new lambda.Function(this, 'GetTodo', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'get.handler',
            code: lambda.Code.fromAsset(functionsPath),
            environment: commonEnv,
            timeout: Duration.seconds(30)
        });

        // Update Todo Lambda
        this.updateFunction = new lambda.Function(this, 'UpdateTodo', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'update.handler',
            code: lambda.Code.fromAsset(functionsPath),
            environment: commonEnv,
            timeout: Duration.seconds(30)
        });

        // Delete Todo Lambda
        this.deleteFunction = new lambda.Function(this, 'DeleteTodo', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'delete.handler',
            code: lambda.Code.fromAsset(functionsPath),
            environment: commonEnv,
            timeout: Duration.seconds(30)
        });

        // List Todos Lambda
        this.listFunction = new lambda.Function(this, 'ListTodos', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'list.handler',
            code: lambda.Code.fromAsset(functionsPath),
            environment: commonEnv,
            timeout: Duration.seconds(30)
        });

        // Grant DynamoDB permissions to Lambda functions
        props.table.grantReadWriteData(this.createFunction);
        props.table.grantReadData(this.getFunction);
        props.table.grantReadWriteData(this.updateFunction);
        props.table.grantWriteData(this.deleteFunction);
        props.table.grantReadData(this.listFunction);
    }
}
