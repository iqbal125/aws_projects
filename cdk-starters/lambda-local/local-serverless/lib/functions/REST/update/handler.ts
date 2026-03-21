import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
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

        const body = JSON.parse(event.body || '{}');

        const updateExpression: string[] = [];
        const expressionAttributeValues: Record<string, any> = {};
        const expressionAttributeNames: Record<string, string> = {};

        if (body.title !== undefined) {
            updateExpression.push('#title = :title');
            expressionAttributeNames['#title'] = 'title';
            expressionAttributeValues[':title'] = body.title;
        }
        if (body.description !== undefined) {
            updateExpression.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = body.description;
        }
        if (body.completed !== undefined) {
            updateExpression.push('#completed = :completed');
            expressionAttributeNames['#completed'] = 'completed';
            expressionAttributeValues[':completed'] = body.completed;
        }

        if (updateExpression.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No fields to update' })
            };
        }

        const result = await ddb.send(new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: { id },
            UpdateExpression: 'SET ' + updateExpression.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.Attributes)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: (error as Error).message })
        };
    }
};
