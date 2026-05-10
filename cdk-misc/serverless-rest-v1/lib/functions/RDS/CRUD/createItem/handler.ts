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
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Powertools
const logger = new Logger({ serviceName: 'CreateItemService' });
const metrics = new Metrics({ namespace: 'ItemsAPI', serviceName: 'CreateItemService' });
const tracer = new Tracer({ serviceName: 'CreateItemService' });

// Zod Schemas
const createItemRequestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});
type CreateItemRequest = z.infer<typeof createItemRequestSchema>;

const createItemResponseSchema = z.object({
    message: z.string(),
    item: z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string(),
    }),
});
type CreateItemResponse = z.infer<typeof createItemResponseSchema>;

// Handler
const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.info('CreateItem request received', { requestId: context.awsRequestId });

    try {
        // ✅ Validate request
        const input: CreateItemRequest = createItemRequestSchema.parse(event.body);

        // ✅ DB work
        const db = await getDb();
        const itemId = uuidv4();
        const [newItem] = await db.insert(schema.items)
            .values({ id: itemId, title: input.title, description: input.description })
            .returning();

        metrics.addMetric('ItemsCreated', MetricUnit.Count, 1);
        logger.info('Item created successfully', { itemId: newItem.id });

        // ✅ Validate response
        const response: CreateItemResponse = createItemResponseSchema.parse({
            message: 'Item created successfully',
            item: {
                id: newItem.id,
                title: newItem.title,
                description: newItem.description,
            },
        });

        return {
            statusCode: 201,
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

        metrics.addMetric('CreateItemErrors', MetricUnit.Count, 1);
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

