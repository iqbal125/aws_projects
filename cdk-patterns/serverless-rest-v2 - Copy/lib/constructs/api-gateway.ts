import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayConstructProps {
    createFunction: lambda.Function;
    getFunction: lambda.Function;
    updateFunction: lambda.Function;
    deleteFunction: lambda.Function;
    listFunction: lambda.Function;
}

export class ApiGatewayConstruct extends Construct {
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);

        // Create REST API
        this.api = new apigateway.RestApi(this, 'TodoApi', {
            restApiName: 'Todo Service',
            description: 'API for managing todo items',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization']
            }
        });

        // Create /todos resource
        const todos = this.api.root.addResource('todos');

        // POST /todos - Create a new todo
        todos.addMethod('POST', new apigateway.LambdaIntegration(props.createFunction));

        // GET /todos - List all todos
        todos.addMethod('GET', new apigateway.LambdaIntegration(props.listFunction));

        // Create /todos/{id} resource
        const todo = todos.addResource('{id}');

        // GET /todos/{id} - Get a specific todo
        todo.addMethod('GET', new apigateway.LambdaIntegration(props.getFunction));

        // PUT /todos/{id} - Update a todo
        todo.addMethod('PUT', new apigateway.LambdaIntegration(props.updateFunction));

        // DELETE /todos/{id} - Delete a todo
        todo.addMethod('DELETE', new apigateway.LambdaIntegration(props.deleteFunction));

    }
}
