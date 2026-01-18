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
import { z } from 'zod';

// Powertools
const logger = new Logger({ serviceName: 'GetItemsService' });
const metrics = new Metrics({ namespace: 'ItemsAPI', serviceName: 'GetItemsService' });
const tracer = new Tracer({ serviceName: 'GetItemsService' });

// Zod Schemas
const getItemsResponseSchema = z.object({
    items: z.array(z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
    })),
    count: z.number().int().nonnegative(),
});
type GetItemsResponse = z.infer<typeof getItemsResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('GetItems request received', { requestId: context.awsRequestId });

    try {
        // ✅ DB work
        const db = await getDb();
        logger.info('Fetching all items from database');

        const items = await db.select().from(schema.items);

        metrics.addMetric('ItemsListRetrieved', MetricUnit.Count, 1);
        metrics.addMetric('ItemsCount', MetricUnit.Count, items.length);
        logger.info('Items retrieved successfully', { count: items.length });

        // ✅ Validate response
        const response: GetItemsResponse = getItemsResponseSchema.parse({
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
            })),
            count: items.length,
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

        metrics.addMetric('GetItemsErrors', MetricUnit.Count, 1);
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