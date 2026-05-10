import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConstructProps {
    table: dynamodb.Table;
    processedTable: dynamodb.Table;
    todoEventsQueue: sqs.Queue;
}

export class LambdaConstruct extends Construct {
    public readonly createFunction: NodejsFunction;
    public readonly getFunction: NodejsFunction;
    public readonly updateFunction: NodejsFunction;
    public readonly deleteFunction: NodejsFunction;
    public readonly listFunction: NodejsFunction;
    public readonly processQueueFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);

        const commonEnv = {
            TABLE_NAME: props.table.tableName,
            QUEUE_URL: props.todoEventsQueue.queueUrl,
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
            entry: path.join(__dirname, './REST/create.ts')
        });

        // Get Todo Lambda
        this.getFunction = new NodejsFunction(this, 'GetTodo', {
            ...commonProps,
            entry: path.join(__dirname, './REST/get.ts')
        });

        // Update Todo Lambda
        this.updateFunction = new NodejsFunction(this, 'UpdateTodo', {
            ...commonProps,
            entry: path.join(__dirname, './REST/update.ts')
        });

        // Delete Todo Lambda
        this.deleteFunction = new NodejsFunction(this, 'DeleteTodo', {
            ...commonProps,
            entry: path.join(__dirname, './REST/delete.ts')
        });

        // List Todos Lambda
        this.listFunction = new NodejsFunction(this, 'ListTodos', {
            ...commonProps,
            entry: path.join(__dirname, './REST/list.ts')
        });


        // Process Queue Lambda
        this.processQueueFunction = new NodejsFunction(this, 'ProcessQueue', {
            runtime: Runtime.NODEJS_20_X,
            handler: 'handler',
            environment: {
                PROCESSED_TABLE_NAME: props.processedTable.tableName,
            },
            timeout: Duration.seconds(30),
            entry: path.join(__dirname, './async/create-process.ts')
        });

        // Add SQS event source to process queue function
        this.processQueueFunction.addEventSource(new SqsEventSource(props.todoEventsQueue, {
            batchSize: 10,
            reportBatchItemFailures: true
        }));

        // Grant DynamoDB permissions to Lambda functions
        props.table.grantReadWriteData(this.createFunction);
        props.table.grantReadData(this.getFunction);
        props.table.grantReadWriteData(this.updateFunction);
        props.table.grantWriteData(this.deleteFunction);
        props.table.grantReadData(this.listFunction);

        // Grant processedTable write permissions to processQueueFunction
        props.processedTable.grantWriteData(this.processQueueFunction);

        // Grant SQS permissions to create Lambda
        props.todoEventsQueue.grantSendMessages(this.createFunction);
    }
}
