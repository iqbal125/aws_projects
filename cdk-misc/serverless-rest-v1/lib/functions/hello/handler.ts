import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// A simple endpoint, can be used to quick health check

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello World!'
        })
    };
};