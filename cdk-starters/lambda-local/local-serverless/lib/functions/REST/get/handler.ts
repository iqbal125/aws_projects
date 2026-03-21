import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id parameter' })
            };
        }

        const result = await ddb.send(new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: { id }
        }));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Todo not found' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};
