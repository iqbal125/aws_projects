import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
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

        await ddb.send(new DeleteCommand({
            TableName: process.env.TABLE_NAME,
            Key: { id }
        }));

        return {
            statusCode: 204,
            body: ''
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};
