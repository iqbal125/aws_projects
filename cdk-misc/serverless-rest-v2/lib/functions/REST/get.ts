import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { Todo } from '../../types/todo';

const logger = new Logger({ serviceName: 'todoService' });
const tracer = new Tracer({ serviceName: 'todoService' });
const metrics = new Metrics({ namespace: 'TodoApp', serviceName: 'todoService' });

const client = tracer.captureAWSv3Client(new DynamoDBClient({}));
const ddb = DynamoDBDocumentClient.from(client);

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;

    if (!id) {
        logger.warn('Missing id parameter');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing id parameter' })
        };
    }

    logger.info('Getting todo item', { id });

    const result = await ddb.send(new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id }
    }));

    if (!result.Item) {
        logger.info('Todo not found', { id });
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Todo not found' })
        };
    }

    const todo = result.Item as Todo;
    metrics.addMetric('TodoRetrieved', MetricUnit.Count, 1);
    logger.info('Todo item retrieved successfully', { id });

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
    };
};

export const handler = middy(lambdaHandler)
    .use(httpErrorHandler());
