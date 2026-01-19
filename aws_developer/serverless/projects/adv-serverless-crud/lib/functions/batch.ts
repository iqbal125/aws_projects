import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// Handler for batch write operations
export const batchWriteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const items = [
            {
                id: randomUUID(),
                title: 'Batch Write Item 1',
                description: 'First item using batch write operation',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Batch Write Item 2',
                description: 'Second item using batch write operation',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Batch Write Item 3',
                description: 'Third item using batch write operation',
                completed: true,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Batch Write Item 4',
                description: 'Fourth item using batch write operation',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Batch Write Item 5',
                description: 'Fifth item using batch write operation',
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];

        console.log(`Batch writing ${items.length} items into table: ${process.env.TABLE_NAME}`);

        // BatchWriteCommand can handle up to 25 items at a time
        // For larger batches, you would need to chunk the array
        const putRequests = items.map(item => ({
            PutRequest: {
                Item: item
            }
        }));

        const result = await ddb.send(new BatchWriteCommand({
            RequestItems: {
                [process.env.TABLE_NAME!]: putRequests
            }
        }));

        // Handle unprocessed items if any
        if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
            console.warn('Some items were not processed:', result.UnprocessedItems);
        }

        console.log('Batch write completed successfully');

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Batch write completed successfully',
                itemsWritten: items.length,
                unprocessedItems: result.UnprocessedItems || {},
                items: items
            })
        };
    } catch (error) {
        console.error('Error during batch write:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to batch write items',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};

// Handler for batch get operations
export const batchGetHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Expect an array of IDs in the request body
        const body = event.body ? JSON.parse(event.body) : {};
        const ids: string[] = body.ids || [];

        if (ids.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'No IDs provided',
                    message: 'Please provide an array of IDs in the request body'
                })
            };
        }

        console.log(`Batch getting ${ids.length} items from table: ${process.env.TABLE_NAME}`);

        // BatchGetCommand can handle up to 100 items at a time
        const keys = ids.map(id => ({ id }));

        const result = await ddb.send(new BatchGetCommand({
            RequestItems: {
                [process.env.TABLE_NAME!]: {
                    Keys: keys
                }
            }
        }));

        const items = result.Responses?.[process.env.TABLE_NAME!] || [];

        // Handle unprocessed keys if any
        if (result.UnprocessedKeys && Object.keys(result.UnprocessedKeys).length > 0) {
            console.warn('Some keys were not processed:', result.UnprocessedKeys);
        }

        console.log(`Batch get completed successfully. Retrieved ${items.length} items`);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Batch get completed successfully',
                itemsRetrieved: items.length,
                unprocessedKeys: result.UnprocessedKeys || {},
                items: items
            })
        };
    } catch (error) {
        console.error('Error during batch get:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to batch get items',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
