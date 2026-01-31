import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';

export class SqsConstruct extends Construct {
    public readonly todoEventsQueue: sqs.Queue;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create SQS queue for todo events
        this.todoEventsQueue = new sqs.Queue(this, 'TodoEventsQueue', {
            queueName: 'todo-events-queue',
            visibilityTimeout: Duration.seconds(300),
            retentionPeriod: Duration.days(4),
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
