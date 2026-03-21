import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export function createUpdateFunction(scope: Construct, id: string, props: Partial<NodejsFunctionProps>) {
    return new NodejsFunction(scope, id, {
        ...props,
        entry: path.join(__dirname, 'handler.ts'),
    });
}
