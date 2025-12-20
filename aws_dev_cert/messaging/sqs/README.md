# SQS (Simple Queue Service)

Fully managed message queuing service for decoupling and scaling microservices, distributed systems, and serverless applications. Supports standard and FIFO queues with message retention.

## Auto Scaling with SQS

Monitor the Amazon SQS queue backlog per instance using the `ApproximateNumberOfMessages` metric.

**Reference**: [Auto Scaling based on SQS](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html)

## Queue Management

### Queue Deletion Options

- **Delete Queue** - Deletes the queue and all messages within it
- **Purge Queue** - Deletes all messages in the queue but keeps the queue itself




Long Polling - reduce cost by not returning reponse immediately 

https://tutorialsdojo.com/amazon-sqs/?src=udemy

