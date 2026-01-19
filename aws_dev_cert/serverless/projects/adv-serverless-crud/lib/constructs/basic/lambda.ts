import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConstructProps {
    table: dynamodb.Table;
}

// Define function paths as constants
const FUNCTIONS_DIR = path.join(__dirname, '../../functions');
const FUNCTION_HANDLERS = {
    create: path.join(FUNCTIONS_DIR, 'CRUD/create.ts'),
    get: path.join(FUNCTIONS_DIR, 'CRUD/get.ts'),
    update: path.join(FUNCTIONS_DIR, 'CRUD/update.ts'),
    delete: path.join(FUNCTIONS_DIR, 'CRUD/delete.ts'),
    list: path.join(FUNCTIONS_DIR, 'CRUD/list.ts'),
    seed: path.join(FUNCTIONS_DIR, 'seed.ts'),
} as const;

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
            entry: FUNCTION_HANDLERS.create
        });

        // Get Todo Lambda
        this.getFunction = new NodejsFunction(this, 'GetTodo', {
            ...commonProps,
            entry: FUNCTION_HANDLERS.get
        });

        // Update Todo Lambda
        this.updateFunction = new NodejsFunction(this, 'UpdateTodo', {
            ...commonProps,
            entry: FUNCTION_HANDLERS.update
        });

        // Delete Todo Lambda
        this.deleteFunction = new NodejsFunction(this, 'DeleteTodo', {
            ...commonProps,
            entry: FUNCTION_HANDLERS.delete
        });

        // List Todos Lambda
        this.listFunction = new NodejsFunction(this, 'ListTodos', {
            ...commonProps,
            entry: FUNCTION_HANDLERS.list
        });

        // Seed Database Lambda
        this.seedFunction = new NodejsFunction(this, 'SeedDatabase', {
            ...commonProps,
            entry: FUNCTION_HANDLERS.seed
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
