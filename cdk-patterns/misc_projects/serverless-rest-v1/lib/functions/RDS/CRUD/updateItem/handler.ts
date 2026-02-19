import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { getDb, schema } from '../../database/database';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Powertools
const logger = new Logger({ serviceName: 'UpdateItemService' });
const metrics = new Metrics({ namespace: 'ItemsAPI', serviceName: 'UpdateItemService' });
const tracer = new Tracer({ serviceName: 'UpdateItemService' });

// Zod Schemas
const updateItemPathSchema = z.object({
    id: z.string().uuid("Invalid item ID format"),
});
type UpdateItemPath = z.infer<typeof updateItemPathSchema>;

const updateItemRequestSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
}).refine(data => data.title !== undefined || data.description !== undefined, {
    message: "At least one field (title or description) must be provided",
});
type UpdateItemRequest = z.infer<typeof updateItemRequestSchema>;

const updateItemResponseSchema = z.object({
    message: z.string(),
    item: z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
    }),
});
type UpdateItemResponse = z.infer<typeof updateItemResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('UpdateItem request received', { requestId: context.awsRequestId });

    try {
        // ✅ Validate path parameters
        const pathParams: UpdateItemPath = updateItemPathSchema.parse({
            id: event.pathParameters?.id
        });

        // ✅ Validate request body
        const input: UpdateItemRequest = updateItemRequestSchema.parse(event.body);

        // ✅ DB work
        const db = await getDb();

        // Check if item exists
        logger.info('Checking if item exists', { itemId: pathParams.id });
        const existingItems = await db.select()
            .from(schema.items)
            .where(eq(schema.items.id, pathParams.id));

        if (existingItems.length === 0) {
            metrics.addMetric('UpdateItemNotFound', MetricUnit.Count, 1);
            logger.warn('Item not found for update', { itemId: pathParams.id });

            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Not Found',
                    message: 'Item not found'
                }),
            };
        }

        // Prepare update data
        const updateFields: any = {};
        if (input.title !== undefined) updateFields.title = input.title;
        if (input.description !== undefined) updateFields.description = input.description;

        // Update item
        logger.info('Updating item', { itemId: pathParams.id, updateFields });
        const [updatedItem] = await db.update(schema.items)
            .set(updateFields)
            .where(eq(schema.items.id, pathParams.id))
            .returning();

        metrics.addMetric('ItemsUpdated', MetricUnit.Count, 1);
        logger.info('Item updated successfully', { itemId: pathParams.id });

        // ✅ Validate response
        const response: UpdateItemResponse = updateItemResponseSchema.parse({
            message: 'Item updated successfully',
            item: {
                id: updatedItem.id,
                title: updatedItem.title,
                description: updatedItem.description,
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

        metrics.addMetric('UpdateItemErrors', MetricUnit.Count, 1);
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
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(httpCors())
    .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger))
    .use(logMetrics(metrics));