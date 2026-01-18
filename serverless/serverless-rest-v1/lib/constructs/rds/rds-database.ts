import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseConstructProps {
    vpc: ec2.Vpc;
    secret: secretsmanager.Secret;
}

export class DatabaseConstruct extends Construct {
    public readonly cluster: rds.DatabaseCluster;
    public readonly clusterArn: string;

    constructor(scope: Construct, id: string, props: DatabaseConstructProps) {
        super(scope, id);

        // Create Aurora Serverless V2 cluster
        this.cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({
                version: rds.AuroraPostgresEngineVersion.VER_15_4
            }),
            credentials: rds.Credentials.fromSecret(props.secret),
            writer: rds.ClusterInstance.serverlessV2('writer', {
                scaleWithWriter: true
            }),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED
            },
            enableDataApi: true,
            defaultDatabaseName: 'itemsdb',
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for demo purposes
            deletionProtection: false
        });

        // Store the cluster ARN for Data API access
        this.clusterArn = this.cluster.clusterArn;
    }
}