import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

// Import Lambda constructs
import { HelloLambda } from '../../functions/hello';
import { GetItemsLambda } from '../../functions/RDS/CRUD/getItems';
import { GetItemLambda } from '../../functions/RDS/CRUD/getItem';
import { CreateItemLambda } from '../../functions/RDS/CRUD/createItem';
import { UpdateItemLambda } from '../../functions/RDS/CRUD/updateItem';
import { DeleteItemLambda } from '../../functions/RDS/CRUD/deleteItem';
import { DynamoGetLambda } from '../../functions/dynamo';


export interface LambdaFunctionsProps {
    cluster: rds.DatabaseCluster;
    secret: secretsmanager.Secret;
    dynamoTable: dynamodb.Table;
}

export class LambdaFunctionsConstruct extends Construct {
    public readonly helloLambda: HelloLambda;
    public readonly getItemsLambda: GetItemsLambda;
    public readonly getItemLambda: GetItemLambda;
    public readonly createItemLambda: CreateItemLambda;
    public readonly updateItemLambda: UpdateItemLambda;
    public readonly deleteItemLambda: DeleteItemLambda;
    public readonly dynamoGetLambda: DynamoGetLambda;

    // Lambda Integrations
    public readonly helloIntegration: apigateway.LambdaIntegration;
    public readonly getItemsIntegration: apigateway.LambdaIntegration;
    public readonly getItemIntegration: apigateway.LambdaIntegration;
    public readonly createItemIntegration: apigateway.LambdaIntegration;
    public readonly updateItemIntegration: apigateway.LambdaIntegration;
    public readonly deleteItemIntegration: apigateway.LambdaIntegration;
    public readonly dynamoGetIntegration: apigateway.LambdaIntegration;


    constructor(scope: Construct, id: string, props: LambdaFunctionsProps) {
        super(scope, id);

        const databaseProps = {
            cluster: props.cluster,
            secret: props.secret
        };

        // Lambda functions using modular constructs
        this.helloLambda = new HelloLambda(this, 'HelloLambda');

        this.getItemsLambda = new GetItemsLambda(this, 'GetItemsLambda', databaseProps);

        this.getItemLambda = new GetItemLambda(this, 'GetItemLambda', databaseProps);

        this.createItemLambda = new CreateItemLambda(this, 'CreateItemLambda', databaseProps);

        this.updateItemLambda = new UpdateItemLambda(this, 'UpdateItemLambda', databaseProps);

        this.deleteItemLambda = new DeleteItemLambda(this, 'DeleteItemLambda', databaseProps);

        // DynamoDB Lambda functions
        this.dynamoGetLambda = new DynamoGetLambda(this, 'DynamoGetLambda', {
            table: props.dynamoTable
        });

        // Create Lambda integrations
        this.helloIntegration = new apigateway.LambdaIntegration(this.helloLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.getItemsIntegration = new apigateway.LambdaIntegration(this.getItemsLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.getItemIntegration = new apigateway.LambdaIntegration(this.getItemLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.createItemIntegration = new apigateway.LambdaIntegration(this.createItemLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.updateItemIntegration = new apigateway.LambdaIntegration(this.updateItemLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.deleteItemIntegration = new apigateway.LambdaIntegration(this.deleteItemLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });

        this.dynamoGetIntegration = new apigateway.LambdaIntegration(this.dynamoGetLambda.alias, {
            requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
        });
    }
}