

Lamdba Authorizer

Use a Lambda authorizer (formerly known as a custom authorizer) to control access to your API. When a client makes a request to your API's method, API Gateway calls your Lambda authorizer. The Lambda authorizer takes the caller's identity as the input and returns an IAM policy as the output.

Use a Lambda authorizer to implement a custom authorization scheme. Your scheme can use request parameters to determine the caller's identity or use a bearer token authentication strategy such as OAuth or SAML. Create a Lambda authorizer in the API Gateway REST API console, using the AWS CLI, or an AWS SDK.

https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html




Integration errors
https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html

https://aws.amazon.com/about-aws/whats-new/2017/11/customize-integration-timeouts-in-amazon-api-gateway/

https://docs.aws.amazon.com/apigateway/latest/developerguide/supported-gateway-response-types.html



## Lambda Proxy Integration

API Gateway passes the raw request to Lambda (headers, query params, path variables, payload, config data). Lambda must return a specific JSON format:

```json
{
    "isBase64Encoded": true|false,
    "statusCode": httpStatusCode,
    "headers": { "headerName": "headerValue", ... },
    "body": "..."
}
```

**Common Errors:**
- **502 Bad Gateway** - Incompatible output format (e.g., XML instead of JSON), malformed response, or out-of-order invocation
- **504 Gateway Timeout** - Request exceeded timeout limit

**References:**
- [Troubleshooting 502 Errors](https://aws.amazon.com/premiumsupport/knowledge-center/malformed-502-api-gateway/)
- [Lambda Proxy Integration Output Format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format)
- [Error Handling](https://docs.aws.amazon.com/apigateway/api-reference/handling-errors/)



Stage Variables 
https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html

https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html