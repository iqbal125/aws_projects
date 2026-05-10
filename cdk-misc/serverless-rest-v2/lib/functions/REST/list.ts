import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { Todo, TodoListResponse } from '../../types/todo';

const logger = new Logger({ serviceName: 'todoService' });
const tracer = new Tracer({ serviceName: 'todoService' });
const metrics = new Metrics({ namespace: 'TodoApp', serviceName: 'todoService' });

const client = tracer.captureAWSv3Client(new DynamoDBClient({}));
const ddb = DynamoDBDocumentClient.from(client);

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Listing all todo items');

    const result = await ddb.send(new ScanCommand({
        TableName: process.env.TABLE_NAME
    }));

    metrics.addMetric('TodosListed', MetricUnit.Count, 1);
    logger.info('Todo items listed successfully', { count: result.Count });

    const response: TodoListResponse = {
        items: (result.Items || []) as Todo[],
        count: result.Count || 0
    };

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
    };
};

export const handler = middy(lambdaHandler)
    .use(httpErrorHandler());
