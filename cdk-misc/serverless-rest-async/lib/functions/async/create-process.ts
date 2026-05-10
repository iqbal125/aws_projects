import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';

const logger = new Logger({ serviceName: 'processQueueService' });
const tracer = new Tracer({ serviceName: 'processQueueService' });
const metrics = new Metrics({ namespace: 'TodoApp', serviceName: 'processQueueService' });

const dynamoClient = tracer.captureAWSv3Client(new DynamoDBClient({}));
const ddb = DynamoDBDocumentClient.from(dynamoClient);

interface TodoEvent {
    eventType: string;
    timestamp: string;
    data: {
        id: string;
        title: string;
        description: string;
        completed: boolean;
        createdAt: string;
    };
}

export interface batchItemFailures {
    batchItemFailures: { itemIdentifier: string; }[];
}

export const handler = async (event: SQSEvent): Promise<batchItemFailures> => {
    logger.info('Processing SQS messages', { recordCount: event.Records.length });
    const failures = []


    for (const record of event.Records) {
        try {
            await processRecord(record);
        } catch (err) {
            failures.push({ itemIdentifier: record.messageId });
        }
    }

    metrics.addMetric('ProcessedMessages', MetricUnit.Count, event.Records.length);
    metrics.publishStoredMetrics();

    return { batchItemFailures: failures };
};

const processRecord = async (record: SQSRecord): Promise<void> => {
    try {
        const todoEvent: TodoEvent = JSON.parse(record.body);

        logger.info('Processing event', {
            eventType: todoEvent.eventType,
            todoId: todoEvent.data.id
        });

        // Create processed event record
        const processedItem = {
            id: `${todoEvent.data.id}-${Date.now()}`,
            originalTodoId: todoEvent.data.id,
            eventType: todoEvent.eventType,
            eventTimestamp: todoEvent.timestamp,
            processedAt: new Date().toISOString(),
            todoData: todoEvent.data,
            messageId: record.messageId
        };

        await ddb.send(new PutCommand({
            TableName: process.env.PROCESSED_TABLE_NAME,
            Item: processedItem
        }));

        logger.info('Successfully processed event', {
            processedId: processedItem.id,
            eventType: todoEvent.eventType
        });

    } catch (error) {
        logger.error('Error processing record', { error, recordBody: record.body });
        throw error;
    }
};
