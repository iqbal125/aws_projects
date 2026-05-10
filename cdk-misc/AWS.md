# AWS Learning and Build Plan

## Core Principle
- Learn AWS through hands-on projects before exams.
- Certs are a side effect of real skill, not the main goal.
- Do not invest in GCP right now; for simple prototypes use Render.

---

## Current Focus: Lambda Local and Testing

### Setup and Refactor
- [ ] Finish local testing setup.
- [ ] Reorganize codebase with tests first.
- [ ] Isolate Lambda handlers (avoid hard-coded imports).
- [ ] Add async examples.
- [ ] Add Kafka example.

### Validation and Utilities
- [ ] Add Zod validation.
- [ ] Add AWS Lambda Powertools.
- [ ] Add Lambda layers for shared Powertools code.
- [ ] Implement `setCorrelationId`.

### Useful References
- https://docs.aws.amazon.com/powertools/typescript/latest/getting-started/usage-patterns/
- https://github.com/aws-samples/powertools-for-aws-lambda-workshop/blob/main/main-workshop/load-generator/src/module1-observability.js
- https://github.com/aws-powertools/powertools-lambda-typescript/tree/main/examples/snippets

---

## Project: Serverless REST API + Frontend
- [ ] Build a simple frontend with a Serverless REST API.
- [ ] Model async UX: statuses, optimistic updates, retries.
- [ ] Integrate SNS, EventBridge, and SQS.
- [ ] Add DynamoDB Streams trigger.
- [ ] Configure SSM Parameter Store.
- [ ] Configure Secrets Manager.
- [ ] Set up aliases and environment strategy.

---

## Service Deep-Dive Roadmap

### DynamoDB
- [ ] Streams -> Lambda
- [ ] Locks
- [ ] Transactions
- [ ] Conditional writes
- [ ] DAX
- [ ] Caching patterns
- [ ] TTL
- [ ] Projection expressions
- [ ] Filtering
- [ ] Batch processing

References:
- https://aws.amazon.com/dynamodb/nosql-workbench/
- https://catalog.us-east-1.prod.workshops.aws/workshops/fc36cb5a-de1b-403f-84dd-cc824390c548/en-US
- https://catalog.workshops.aws/serverless-developer-experience/en-US
- https://github.com/awslabs/amazon-kinesis-data-generator

### Lambda
- [ ] Sync vs async invocation patterns
- [ ] Lambda layers
- [ ] Versions
- [ ] Aliases
- [ ] Stage variables
- [ ] Event and context
- [ ] ALB integrations
- [ ] Batching behavior (timing, limits, retries)
- [ ] Local debugging
- [ ] Event archive usage

References:
- https://github.com/alexcasalboni/aws-lambda-power-tuning
- https://github.com/aws-samples/ask-around-me
- https://builder.aws.com/learn/topics
- https://github.com/aws-samples/serverless-patterns?utm_source=chatgpt.com

### Lambda Error Handling and Reliability
- [ ] DLQ + retry + poison-pill handling
- [ ] Partial batch failure examples
- [ ] Backpressure and event-latency monitoring
- [ ] Cold start monitoring
- [ ] High-latency monitoring
- [ ] General performance metrics

Reference:
- https://serverlessland.com/content/service/lambda/guides/aws-lambda-operator-guide/monitoring-observability

### API Gateway
- [ ] Request/response integrations
- [ ] Stage and environment strategy

### Observability
- [ ] CloudWatch metrics and alarms
- [ ] Log retention and structured logging
- [ ] X-Ray tracing
- [ ] Telemetry standards

### Data Governance and PII
- [ ] Governance model for AWS data platforms
- [ ] PII handling and controls
- [ ] Evaluate Snowflake fit for use cases

Reference:
- https://serverlessland.com/content/service/lambda/guides/governance/1-introduction

---

## Career and Learning Direction

### Certification Direction (current thought)
- AWS Developer Associate -> AWS ML Associate -> AWS GenAI Professional
- AI Practitioner currently seems low-value for this path

### Tooling and Ecosystem
- [ ] Learn CDK Toolkit deeply.
- [ ] Create a CloudWatch alarm end-to-end.
- [ ] Build one complete data ingestion and data pipeline project.
- [ ] Contribute to SAR (toward AWS verified author path).

---

## Learning Platforms and Study Material
- https://app.exampro.co/student/catalog/dashboard
- https://skillcertpro.com/my-account/courses/
- https://learn.cantrill.io/courses/enrolled/1101194
- https://github.com/itsmostafa/certified-aws-developer-associate-notes/blob/master/2-aws-deep-dive/elastic-beanstalk.md
- https://skillbuilder.aws/learning-plan/BPW9CJQB5Y/builder-labs-implement-advanced-serverless-and-eventdriven-architectures/GUT6DT1E96
- https://skillbuilder.aws/learn/EHKK2F9XQV/digital-classroom--developing-serverless-solutions-on-aws/ZF1VB8BT4A
- https://preporato.com/study-guide/generative-ai-developer-professional/module-1/topic-1-1/1-1-1

---

## AWS Resources and Communities
- https://aws.amazon.com/media/
- https://repost.aws/
- https://aws.amazon.com/builders-library/
- https://builder.aws.com/community/community-builders
- https://github.com/aws-samples
- https://docs.aws.amazon.com/step-functions/latest/dg/starter-templates.html
- https://docs.aws.amazon.com/code-library/
- https://github.com/aws-samples/serverless-test-samples/tree/main/typescript-test-samples/typescript-test-intro
- https://github.com/awslabs/aws-solutions-constructs?tab=readme-ov-file
- https://aws.amazon.com/devops-agent/
- https://serverlessland.com
- https://www.cloudcraft.co/
- https://github.com/boyney123/awesome-eventbridge
- https://www.brainstobytes.com/
- https://aws.amazon.com/training/learning-subject-matter-expert-program/
- https://github.com/NebulaTris/aws-saa-c03-crash-course

---

## Engineering Blogs (Top Picks)
1. [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/)
2. [Netflix Tech Blog](https://netflixtechblog.com/)
3. [Uber Engineering Blog](https://www.uber.com/en-US/blog/engineering/)
4. [Microservices.io (Chris Richardson)](https://microservices.io/)
5. [The Pragmatic Engineer](https://blog.pragmaticengineer.com/)
