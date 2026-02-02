import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import { Todo, CreateTodoInput } from '../../types/todo';

const logger = new Logger({ serviceName: 'todoService' });
const tracer = new Tracer({ serviceName: 'todoService' });
const metrics = new Metrics({ namespace: 'TodoApp', serviceName: 'todoService' });

const dynamoClient = tracer.captureAWSv3Client(new DynamoDBClient({}));
const ddb = DynamoDBDocumentClient.from(dynamoClient);

const sqsClient = tracer.captureAWSv3Client(new SQSClient({}));

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = event.body as unknown as CreateTodoInput;
    const id = Date.now().toString();

    logger.info('Creating todo item', { id });

    const item: Todo = {
        id,
        title: body.title,
        description: body.description || '',
        completed: false,
        createdAt: new Date().toISOString()
    };

    await ddb.send(new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: item
    }));

    // Send TodoCreated event to SQS
    await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify({
            eventType: 'TodoCreated',
            timestamp: new Date().toISOString(),
            data: item
        })
    }));

    metrics.addMetric('TodoCreated', MetricUnit.Count, 1);
    logger.info('Todo item created successfully', { id });

    return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    };
};

export const handler = middy(lambdaHandler)
    .use(httpJsonBodyParser({ disableContentTypeError: true }))
    .use(httpErrorHandler());
