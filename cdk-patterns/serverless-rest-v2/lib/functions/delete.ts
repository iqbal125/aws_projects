import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

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

    logger.info('Deleting todo item', { id });

    await ddb.send(new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id }
    }));

    metrics.addMetric('TodoDeleted', MetricUnit.Count, 1);
    logger.info('Todo item deleted successfully', { id });

    return {
        statusCode: 204,
        body: ''
    };
};

export const handler = middy(lambdaHandler)
    .use(httpErrorHandler());
