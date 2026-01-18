import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

// Import Lambda constructs
import { DynamoGetLambda } from '../../functions/dynamo';


export interface LambdaFunctionsProps {
    dynamoTable: dynamodb.Table;
}

export class DynamoLambdaFunctionsConstruct extends Construct {
    public readonly dynamoGetLambda: DynamoGetLambda;

    // Lambda Integrations
    public readonly dynamoGetIntegration: apigateway.LambdaIntegration;


    constructor(scope: Construct, id: string, props: LambdaFunctionsProps) {
        super(scope, id);


        // DynamoDB Lambda functions
        this.dynamoGetLambda = new DynamoGetLambda(this, 'DynamoGetLambda', {
            table: props.dynamoTable
        });


        this.dynamoGetIntegration = new apigateway.LambdaIntegration(this.dynamoGetLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });
    }
}