import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { LambdaFunctionsConstruct } from './rds/rds-lambda-functions';
import { DynamoLambdaFunctionsConstruct } from './dynamodb/dynamo-lamdba-funcs';

export interface ApiGatewayProps {
    lambdaFunctions: LambdaFunctionsConstruct;
    dynamoFunctions: DynamoLambdaFunctionsConstruct;
}

export class ApiGatewayConstruct extends Construct {
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id);

        // API Gateway
        this.api = new apigateway.RestApi(this, 'ServerlessRestApi', {
            restApiName: 'Serverless REST API',
            description: 'Serverless REST API with Lambda integration',
            deployOptions: {
                stageName: "dev",
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization']
            }
        });

        // Create Lambda integrations using aliases
        /**
         * RDS Funtions
         * 
         */
        // Add GET method to root resource
        this.api.root.addMethod('GET', props.lambdaFunctions.helloIntegration);

        // Add /hello resource with GET method
        const helloResource = this.api.root.addResource('hello');
        helloResource.addMethod('GET', props.lambdaFunctions.helloIntegration);

        // Add /items resource for CRUD operations
        const itemsResource = this.api.root.addResource('items');
        itemsResource.addMethod('GET', props.lambdaFunctions.getItemsIntegration); // Get all items
        itemsResource.addMethod('POST', props.lambdaFunctions.createItemIntegration); // Create new item

        // Add /items/{id} resource for individual item operations
        const itemResource = itemsResource.addResource('{id}');
        itemResource.addMethod('GET', props.lambdaFunctions.getItemIntegration); // Get specific item
        itemResource.addMethod('PUT', props.lambdaFunctions.updateItemIntegration); // Update specific item
        itemResource.addMethod('DELETE', props.lambdaFunctions.deleteItemIntegration); // Delete specific item



        /** 
         *  Dynamo Functions
         * 
         */
        // Add /dynamo resource for DynamoDB operations
        const dynamoResource = this.api.root.addResource('dynamo');

        // Add /dynamo/{id} resource for getting items from DynamoDB
        const dynamoItemResource = dynamoResource.addResource('{id}');
        dynamoItemResource.addMethod('GET', props.dynamoFunctions.dynamoGetIntegration); // Get specific item from DynamoDB


        // Output the API URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.url,
            description: 'URL of the Serverless REST API'
        });
    }
}