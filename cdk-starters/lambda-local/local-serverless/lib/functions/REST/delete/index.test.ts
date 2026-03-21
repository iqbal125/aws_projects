import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: vi.fn(() => ({ send: sendMock })) },
    DeleteCommand: class { constructor(public input: any) { } },
}));

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
    ({
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'DELETE',
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

describe('DELETE /todo/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TABLE_NAME = 'TestTable';
    });

    it('returns 400 when id is missing', async () => {
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent());
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ error: 'Missing id parameter' });
    });

    it('returns 204 on successful delete', async () => {
        sendMock.mockResolvedValueOnce({});
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ pathParameters: { id: '123' } }));
        expect(result.statusCode).toBe(204);
        expect(result.body).toBe('');
    });

    it('returns 500 on DynamoDB error', async () => {
        sendMock.mockRejectedValueOnce(new Error('DynamoDB failure'));
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ pathParameters: { id: '123' } }));
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'DynamoDB failure' });
    });
});
