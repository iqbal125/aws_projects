import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: vi.fn(() => ({ send: sendMock })) },
    PutCommand: class { constructor(public input: any) { } },
}));

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
    ({
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'POST',
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

describe('POST /todo (create)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TABLE_NAME = 'TestTable';
    });

    it('creates a todo item and returns 201', async () => {
        sendMock.mockResolvedValueOnce({});
        const { handler } = await import('./handler.js');
        const result = await handler(
            makeEvent({ body: JSON.stringify({ title: 'Buy milk', description: 'From store' }) }),
        );
        expect(result.statusCode).toBe(201);
        const item = JSON.parse(result.body);
        expect(item.title).toBe('Buy milk');
        expect(item.description).toBe('From store');
        expect(item.completed).toBe(false);
        expect(item.id).toBeDefined();
        expect(item.createdAt).toBeDefined();
    });

    it('defaults description to empty string', async () => {
        sendMock.mockResolvedValueOnce({});
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ body: JSON.stringify({ title: 'Test' }) }));
        const item = JSON.parse(result.body);
        expect(item.description).toBe('');
    });

    it('returns 500 on DynamoDB error', async () => {
        sendMock.mockRejectedValueOnce(new Error('DynamoDB failure'));
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ body: JSON.stringify({ title: 'Fail' }) }));
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'DynamoDB failure' });
    });
});
