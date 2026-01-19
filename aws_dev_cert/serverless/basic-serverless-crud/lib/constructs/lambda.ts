import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConstructProps {
    table: dynamodb.Table;
}

export class LambdaConstruct extends Construct {
    public readonly createFunction: NodejsFunction;
    public readonly getFunction: NodejsFunction;
    public readonly updateFunction: NodejsFunction;
    public readonly deleteFunction: NodejsFunction;
    public readonly listFunction: NodejsFunction;
    public readonly seedFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);

        const commonEnv = {
            TABLE_NAME: props.table.tableName,
        };

        const commonProps = {
            runtime: Runtime.NODEJS_20_X,
            handler: 'handler',
            environment: commonEnv,
            timeout: Duration.seconds(30)
        };

        // Create Todo Lambda
        this.createFunction = new NodejsFunction(this, 'CreateTodo', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/create.ts')
        });

        // Get Todo Lambda
        this.getFunction = new NodejsFunction(this, 'GetTodo', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/get.ts')
        });

        // Update Todo Lambda
        this.updateFunction = new NodejsFunction(this, 'UpdateTodo', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/update.ts')
        });

        // Delete Todo Lambda
        this.deleteFunction = new NodejsFunction(this, 'DeleteTodo', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/delete.ts')
        });

        // List Todos Lambda
        this.listFunction = new NodejsFunction(this, 'ListTodos', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/list.ts')
        });

        // Seed Database Lambda
        this.seedFunction = new NodejsFunction(this, 'SeedDatabase', {
            ...commonProps,
            entry: path.join(__dirname, '../functions/seed.ts')
        });

        // Grant DynamoDB permissions to Lambda functions
        props.table.grantReadWriteData(this.createFunction);
        props.table.grantReadData(this.getFunction);
        props.table.grantReadWriteData(this.updateFunction);
        props.table.grantWriteData(this.deleteFunction);
        props.table.grantReadData(this.listFunction);
        props.table.grantWriteData(this.seedFunction);
    }
}
