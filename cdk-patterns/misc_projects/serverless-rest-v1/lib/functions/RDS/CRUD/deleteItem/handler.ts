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
const logger = new Logger({ serviceName: 'DeleteItemService' });
const metrics = new Metrics({ namespace: 'ItemsAPI', serviceName: 'DeleteItemService' });
const tracer = new Tracer({ serviceName: 'DeleteItemService' });

// Zod Schemas
const deleteItemPathSchema = z.object({
    id: z.string().uuid("Invalid item ID format"),
});
type DeleteItemPath = z.infer<typeof deleteItemPathSchema>;

const deleteItemResponseSchema = z.object({
    message: z.string(),
    item: z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
    }),
});
type DeleteItemResponse = z.infer<typeof deleteItemResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('DeleteItem request received', { requestId: context.awsRequestId });

    try {
        // ✅ Validate path parameters
        const pathParams: DeleteItemPath = deleteItemPathSchema.parse({
            id: event.pathParameters?.id
        });

        // ✅ DB work
        const db = await getDb();
        logger.info('Deleting item from database', { itemId: pathParams.id });

        const deletedItems = await db.delete(schema.items)
            .where(eq(schema.items.id, pathParams.id))
            .returning();

        if (deletedItems.length === 0) {
            metrics.addMetric('DeleteItemNotFound', MetricUnit.Count, 1);
            logger.warn('Item not found for deletion', { itemId: pathParams.id });

            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Not Found',
                    message: 'Item not found'
                }),
            };
        }

        metrics.addMetric('ItemsDeleted', MetricUnit.Count, 1);
        logger.info('Item deleted successfully', { itemId: pathParams.id });

        // ✅ Validate response
        const response: DeleteItemResponse = deleteItemResponseSchema.parse({
            message: 'Item deleted successfully',
            item: {
                id: deletedItems[0].id,
                title: deletedItems[0].title,
                description: deletedItems[0].description,
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

        metrics.addMetric('DeleteItemErrors', MetricUnit.Count, 1);
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