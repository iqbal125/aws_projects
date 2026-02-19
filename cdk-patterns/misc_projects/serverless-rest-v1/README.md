# Serverless REST API

## Todo 

- ~~add dynamodb tools~~ migrated to Aurora PostgreSQL
- add cloudwatch tools 
- add lambda powertools
- batch processing
- idempotentcy
- local invoke sam lambda
- add versioning 
- add alias/env

- performance / load testing / k6s

- add unit tests for handlers 
- add unit tests for constructs in lib/tests


- lambda state machine example
- add auth

- sqs/sns
- DLQ




A complete serverless REST API built with AWS CDK, featuring Lambda functions, Aurora PostgreSQL, and API Gateway.

## Architecture

- **API Gateway** - REST API endpoints with CORS support
- **AWS Lambda** - Serverless functions for business logic
- **Aurora PostgreSQL** - Serverless V2 database with automatic scaling
- **VPC** - Isolated network environment for security
- **Secrets Manager** - Secure database credential management
- **TypeScript** - Type-safe development experience

## Features

- ✅ Full CRUD operations for items
- ✅ Serverless architecture with Aurora Serverless V2
- ✅ Infrastructure as Code with AWS CDK
- ✅ Type-safe with TypeSQL/PostgreSQL
- ✅ Modular construct organization
- ✅ VPC security and isolation
- ✅ Automatic database scaling
- ✅ Easy deployment and cleanup

## API Endpoints

- `GET /` - Hello world endpoint
- `GET /hello` - Alternative hello endpoint
- `GET /items` - Get all items
- `POST /items` - Create a new item
- `GET /items/{id}` - Get a specific item
- `PUT /items/{id}` - Update a specific item
- `DELETE /items/{id}` - Delete a specific item
- `POST /init-db` - Initialize database schema (call after deployment)

## Project Structure

```
├── app.ts                          # CDK app entry point
├── lib/
│   ├── main-stack.ts              # Main stack orchestration
│   └── constructs/                # Modular constructs
│       ├── database.ts            # Aurora PostgreSQL cluster
│       ├── lambda-functions.ts    # Lambda function definitions
│       └── api-gateway.ts         # API Gateway configuration
├── functions/                     # Lambda function handlers
│   ├── shared/
│   │   └── database.ts           # Database connection utility
│   ├── hello/
│   ├── createItem/
│   ├── getItems/
│   ├── getItem/
│   ├── updateItem/
│   ├── deleteItem/
│   └── initDb/                   # Database schema initialization
└── package.json
```

## Database Schema

Items are stored in PostgreSQL with the following structure:

```sql
CREATE TABLE items (
    id UUID PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Deployment

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Deploy: `npx cdk deploy`
4. Initialize database: `curl -X POST <API_URL>/init-db`

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
