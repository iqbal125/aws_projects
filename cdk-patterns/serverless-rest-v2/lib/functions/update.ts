import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import { Todo, UpdateTodoInput } from '../types/todo';

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

    const body = event.body as UpdateTodoInput;

    const updateExpression: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (body.title !== undefined) {
        updateExpression.push('#title = :title');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeValues[':title'] = body.title;
    }
    if (body.description !== undefined) {
        updateExpression.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = body.description;
    }
    if (body.completed !== undefined) {
        updateExpression.push('#completed = :completed');
        expressionAttributeNames['#completed'] = 'completed';
        expressionAttributeValues[':completed'] = body.completed;
    }

    if (updateExpression.length === 0) {
        logger.warn('No fields to update', { id });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No fields to update' })
        };
    }

    logger.info('Updating todo item', { id, fields: Object.keys(body) });

    const result = await ddb.send(new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id },
        UpdateExpression: 'SET ' + updateExpression.join(', '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }));

    metrics.addMetric('TodoUpdated', MetricUnit.Count, 1);
    logger.info('Todo item updated successfully', { id });

    const updatedTodo = result.Attributes as Todo;
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
    };
};

export const handler = middy(lambdaHandler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());
