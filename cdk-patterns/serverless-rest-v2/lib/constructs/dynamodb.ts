import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
    public readonly table: dynamodb.Table;
    public readonly processedTable: dynamodb.Table;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create DynamoDB table for todo items
        this.table = new dynamodb.Table(this, 'TodoTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY, // For dev purposes
            tableName: 'TodoItems'
        });

        // Create DynamoDB table for processed events
        this.processedTable = new dynamodb.Table(this, 'ProcessedTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY, // For dev purposes
            tableName: 'ProcessedEvents'
        });
    }
}
