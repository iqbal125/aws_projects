import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';


const dynamoDBClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
    },
});

export const TABLE_NAME = process.env.TABLE_NAME || 'ECommerceTable';


export default documentClient
