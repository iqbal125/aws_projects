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
import { getDb, schema } from '../../database/database';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Powertools
const logger = new Logger({ serviceName: 'GetItemService' });
const metrics = new Metrics({ namespace: 'ItemsAPI', serviceName: 'GetItemService' });
const tracer = new Tracer({ serviceName: 'GetItemService' });

// Zod Schemas
const getItemPathSchema = z.object({
    id: z.string().uuid("Invalid item ID format"),
});
type GetItemPath = z.infer<typeof getItemPathSchema>;

const getItemResponseSchema = z.object({
    item: z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
    }),
});
type GetItemResponse = z.infer<typeof getItemResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('GetItem request received', { requestId: context.awsRequestId });

    try {
        // ✅ Validate path parameters
        const pathParams: GetItemPath = getItemPathSchema.parse({
            id: event.pathParameters?.id
        });

        // ✅ DB work
        const db = await getDb();
        logger.info('Fetching item from database', { itemId: pathParams.id });

        const items = await db.select()
            .from(schema.items)
            .where(eq(schema.items.id, pathParams.id));

        if (items.length === 0) {
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
        const response: GetItemResponse = getItemResponseSchema.parse({
            item: {
                id: items[0].id,
                title: items[0].title,
                description: items[0].description,
            },
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
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