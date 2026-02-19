import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import docClient from './database.ts/dbClient';
import { z } from 'zod';

const TABLE_NAME = process.env.TABLE_NAME || '';

// Powertools
const logger = new Logger({ serviceName: 'GetDynamoItemService' });
const metrics = new Metrics({ namespace: 'DynamoAPI', serviceName: 'GetDynamoItemService' });
const tracer = new Tracer({ serviceName: 'GetDynamoItemService' });

// Zod Schemas
const getItemPathSchema = z.object({
    id: z.string().min(1, "Invalid item ID format"),
});
type GetItemPath = z.infer<typeof getItemPathSchema>;

const getItemResponseSchema = z.object({
    item: z.record(z.any()),
});
type GetItemResponse = z.infer<typeof getItemResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('GetDynamoItem request received', { requestId: context.awsRequestId });

    try {
        // ✅ Validate path parameters
        const pathParams: GetItemPath = getItemPathSchema.parse({
            id: event.pathParameters?.id
        });

        // ✅ DynamoDB work
        logger.info('Fetching item from DynamoDB', { itemId: pathParams.id });

        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                id: pathParams.id
            }
        });

        const response = await docClient.send(command);

        if (!response.Item) {
            metrics.addMetric('ItemNotFound', MetricUnit.Count, 1);
            logger.warn('Item not found', { itemId: pathParams.id });

            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Not Found',
                    message: 'Item not found'
                }),
            };
        }

        metrics.addMetric('ItemsRetrieved', MetricUnit.Count, 1);
        logger.info('Item retrieved successfully', { itemId: pathParams.id });

        // ✅ Validate response
        const validatedResponse: GetItemResponse = getItemResponseSchema.parse({
            item: response.Item,
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedResponse.item),
        };
    } catch (err) {
        if (err instanceof z.ZodError) {
            metrics.addMetric('ValidationErrors', MetricUnit.Count, 1);
            logger.warn('Validation failed', { issues: err.errors });

            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'ValidationError', details: err.errors }),
            };
        }

        metrics.addMetric('GetItemErrors', MetricUnit.Count, 1);
        logger.error('Unexpected error', {
            error: err instanceof Error ? err.message : String(err),
        });

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Internal server error',
                details: err instanceof Error ? err.message : String(err),
            }),
        };
    }
};

// Middy
export const handler = middy(lambdaHandler)
    .use(httpErrorHandler())
    .use(httpCors())
    .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger))
    .use(logMetrics(metrics));
