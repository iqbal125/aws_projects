import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const items = [
            {
                id: randomUUID(),
                title: 'Learn AWS Lambda',
                description: 'Complete serverless tutorial and deploy first function',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Build REST API with API Gateway',
                description: 'Create a complete CRUD API using API Gateway and Lambda',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Deploy with AWS CDK',
                description: 'Use Infrastructure as Code to deploy the entire stack',
                completed: true,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Set up DynamoDB tables',
                description: 'Design and implement NoSQL database schema',
                completed: true,
                createdAt: new Date().toISOString()
            },
            {
                id: randomUUID(),
                title: 'Implement monitoring and logging',
                description: 'Add CloudWatch metrics and logs to the application',
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];

        console.log(`Seeding ${items.length} items into table: ${process.env.TABLE_NAME}`);

        for (const item of items) {
            await ddb.send(new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: item
            }));

            console.log(`Seeded item: ${item.id} - ${item.title}`);
        }

        console.log('Seeding completed successfully');

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Database seeded successfully',
                itemsSeeded: items.length,
                items: items
            })
        };
    } catch (error) {
        console.error('Error seeding data:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to seed database',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
