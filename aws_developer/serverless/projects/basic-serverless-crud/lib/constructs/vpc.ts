import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcConstructProps {
    /**
     * Maximum number of Availability Zones to use
     * @default 2
     */
    maxAzs?: number;

    /**
     * Number of NAT Gateways to create
     * @default 0
     */
    natGateways?: number;

    /**
     * CIDR mask for subnets
     * @default 24
     */
    cidrMask?: number;
}

export class VpcConstruct extends Construct {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props?: VpcConstructProps) {
        super(scope, id);

        // Create VPC for database and Lambda functions
        this.vpc = new ec2.Vpc(this, 'Vpc', {
            maxAzs: props?.maxAzs || 2,
            natGateways: props?.natGateways || 0,
            subnetConfiguration: [
                {
                    cidrMask: props?.cidrMask || 24,
                    name: 'database',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ]
        });

    }
}
