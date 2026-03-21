import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: vi.fn(() => ({ send: sendMock })) },
    UpdateCommand: class { constructor(public input: any) { } },
}));

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
    ({
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'PUT',
        isBase64Encoded: false,
        path: '',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '',
        ...overrides,
    }) as APIGatewayProxyEvent;

describe('PUT /todo/:id (update)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TABLE_NAME = 'TestTable';
    });

    it('returns 400 when id is missing', async () => {
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ body: JSON.stringify({ title: 'New' }) }));
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ error: 'Missing id parameter' });
    });

    it('returns 400 when no fields to update', async () => {
        const { handler } = await import('./handler.js');
        const result = await handler(
            makeEvent({ pathParameters: { id: '123' }, body: JSON.stringify({}) }),
        );
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ error: 'No fields to update' });
    });

    it('updates title and returns 200', async () => {
        const updated = { id: '123', title: 'Updated', completed: false };
        sendMock.mockResolvedValueOnce({ Attributes: updated });
        const { handler } = await import('./handler.js');
        const result = await handler(
            makeEvent({
                pathParameters: { id: '123' },
                body: JSON.stringify({ title: 'Updated' }),
            }),
        );
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(updated);
    });

    it('updates multiple fields', async () => {
        const updated = { id: '1', title: 'A', description: 'B', completed: true };
        sendMock.mockResolvedValueOnce({ Attributes: updated });
        const { handler } = await import('./handler.js');
        const result = await handler(
            makeEvent({
                pathParameters: { id: '1' },
                body: JSON.stringify({ title: 'A', description: 'B', completed: true }),
            }),
        );
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(updated);
    });

    it('returns 500 on DynamoDB error', async () => {
        sendMock.mockRejectedValueOnce(new Error('DynamoDB failure'));
        const { handler } = await import('./handler.js');
        const result = await handler(
            makeEvent({
                pathParameters: { id: '123' },
                body: JSON.stringify({ title: 'Fail' }),
            }),
        );
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'DynamoDB failure' });
    });
});
