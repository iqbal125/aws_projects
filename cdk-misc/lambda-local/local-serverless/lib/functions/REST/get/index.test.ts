import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: vi.fn(() => ({ send: sendMock })) },
    GetCommand: class { constructor(public input: any) { } },
}));

const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent =>
    ({
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
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

describe('GET /todo/:id', () => {
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

    it('returns 404 when item is not found', async () => {
        sendMock.mockResolvedValueOnce({ Item: undefined });
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ pathParameters: { id: '123' } }));
        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual({ error: 'Todo not found' });
    });

    it('returns 200 with the item when found', async () => {
        const todo = { id: '123', title: 'Test', completed: false };
        sendMock.mockResolvedValueOnce({ Item: todo });
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ pathParameters: { id: '123' } }));
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(todo);
    });

    it('returns 500 on DynamoDB error', async () => {
        sendMock.mockRejectedValueOnce(new Error('DynamoDB failure'));
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent({ pathParameters: { id: '123' } }));
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'DynamoDB failure' });
    });
});
