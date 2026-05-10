import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createCreateFunction } from '../functions/REST/create/index.js';
import { createGetFunction } from '../functions/REST/get/index.js';
import { createUpdateFunction } from '../functions/REST/update/index.js';
import { createDeleteFunction } from '../functions/REST/delete/index.js';
import { createListFunction } from '../functions/REST/list/index.js';

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

        this.createFunction = createCreateFunction(this, 'CreateTodo', commonProps);
        this.getFunction = createGetFunction(this, 'GetTodo', commonProps);
        this.updateFunction = createUpdateFunction(this, 'UpdateTodo', commonProps);
        this.deleteFunction = createDeleteFunction(this, 'DeleteTodo', commonProps);
        this.listFunction = createListFunction(this, 'ListTodos', commonProps);

        // Grant DynamoDB permissions to Lambda functions
        props.table.grantReadWriteData(this.createFunction);
        props.table.grantReadData(this.getFunction);
        props.table.grantReadWriteData(this.updateFunction);
        props.table.grantWriteData(this.deleteFunction);
        props.table.grantReadData(this.listFunction);
    }
}
