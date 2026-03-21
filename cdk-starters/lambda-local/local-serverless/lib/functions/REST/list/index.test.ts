import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const sendMock = vi.fn();

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: class { },
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: { from: vi.fn(() => ({ send: sendMock })) },
    ScanCommand: class { constructor(public input: any) { } },
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

describe('GET /todos (list)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TABLE_NAME = 'TestTable';
    });

    it('returns 200 with items and count', async () => {
        const items = [
            { id: '1', title: 'First', completed: false },
            { id: '2', title: 'Second', completed: true },
        ];
        sendMock.mockResolvedValueOnce({ Items: items, Count: 2 });
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent());
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ items, count: 2 });
    });

    it('returns empty array when no items exist', async () => {
        sendMock.mockResolvedValueOnce({ Items: undefined, Count: 0 });
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent());
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ items: [], count: 0 });
    });

    it('returns 500 on DynamoDB error', async () => {
        sendMock.mockRejectedValueOnce(new Error('DynamoDB failure'));
        const { handler } = await import('./handler.js');
        const result = await handler(makeEvent());
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: 'DynamoDB failure' });
    });
});
