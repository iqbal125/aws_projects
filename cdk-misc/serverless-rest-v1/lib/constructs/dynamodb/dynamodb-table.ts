import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DynamoDBTableConstructProps {
    /**
     * The name of the DynamoDB table
     * @default 'ItemsTable'
     */
    tableName?: string;

    /**
     * The name of the partition key
     * @default 'id'
     */
    partitionKey?: string;

    /**
     * The name of the sort key (optional)
     */
    sortKey?: string;

    /**
     * Enable point-in-time recovery
     * @default true
     */
    pointInTimeRecovery?: boolean;

    /**
     * The billing mode for the table
     * @default BillingMode.PAY_PER_REQUEST
     */
    billingMode?: dynamodb.BillingMode;

    /**
     * Removal policy for the table
     * @default RemovalPolicy.DESTROY (for development)
     */
    removalPolicy?: cdk.RemovalPolicy;
}

export class DynamoDBTableConstruct extends Construct {
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: DynamoDBTableConstructProps) {
        super(scope, id);

        // Create DynamoDB table with best practices
        this.table = new dynamodb.Table(this, 'Table', {
            tableName: props?.tableName || 'ItemsTable',
            partitionKey: {
                name: props?.partitionKey || 'id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: props?.sortKey ? {
                name: props.sortKey,
                type: dynamodb.AttributeType.STRING
            } : undefined,
            billingMode: props?.billingMode || dynamodb.BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: props?.pointInTimeRecovery ?? true,
            removalPolicy: props?.removalPolicy || cdk.RemovalPolicy.DESTROY,
            deletionProtection: false, // Set to true in production
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // Enable streams for event processing
            timeToLiveAttribute: 'ttl', // Enable TTL support
        });

        // Add a Global Secondary Index (GSI) for common query patterns
        this.table.addGlobalSecondaryIndex({
            indexName: 'StatusIndex',
            partitionKey: {
                name: 'status',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'createdAt',
                type: dynamodb.AttributeType.STRING
            },
            projectionType: dynamodb.ProjectionType.ALL
        });

        // Output the table name and ARN
        new cdk.CfnOutput(this, 'TableName', {
            value: this.table.tableName,
            description: 'DynamoDB Table Name',
            exportName: 'DynamoDBTableName'
        });

        new cdk.CfnOutput(this, 'TableArn', {
            value: this.table.tableArn,
            description: 'DynamoDB Table ARN',
            exportName: 'DynamoDBTableArn'
        });

        new cdk.CfnOutput(this, 'TableStreamArn', {
            value: this.table.tableStreamArn || 'No stream configured',
            description: 'DynamoDB Table Stream ARN'
        });
    }
}
