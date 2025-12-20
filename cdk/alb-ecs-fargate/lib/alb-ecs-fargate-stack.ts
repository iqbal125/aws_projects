import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import {
  ECR_REPOSITORY_NAME,
  IMAGE_TAG,
  CONTAINER_PORT,
  APP_NAME,
  DESIRED_COUNT,
  CPU,
  MEMORY,
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_INTERVAL,
  HEALTH_CHECK_TIMEOUT,
  HEALTHY_THRESHOLD,
  UNHEALTHY_THRESHOLD,
  MIN_CAPACITY,
  MAX_CAPACITY,
  NODE_ENV,
  PORT,
  APP_VERSION,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRATION,
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  CORS_ENABLED,
  CORS_ORIGIN,
} from '../utils/constants';

export class AlbEcsFargateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    const vpc = new ec2.Vpc(this, 'FargateVpc', {
      maxAzs: 2, // Use 2 Availability Zones for high availability
      natGateways: 1, // Use 1 NAT Gateway to reduce costs
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc: vpc,
      clusterName: 'alb-fargate-cluster',
    });

    // Reference your existing ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'EcrRepo',
      ECR_REPOSITORY_NAME
    );

    // Create Application Load Balanced Fargate Service
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster: cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, IMAGE_TAG),
        containerPort: CONTAINER_PORT,
        environment: {
          // Application Configuration
          NODE_ENV: NODE_ENV,
          PORT: PORT,
          APP_NAME: APP_NAME,
          APP_VERSION: APP_VERSION,

          // Database
          DATABASE_URL: DATABASE_URL,

          // JWT Authentication
          JWT_SECRET: JWT_SECRET,
          JWT_EXPIRATION: JWT_EXPIRATION,

          // API Documentation
          SWAGGER_TITLE: SWAGGER_TITLE,
          SWAGGER_DESCRIPTION: SWAGGER_DESCRIPTION,
          SWAGGER_VERSION: SWAGGER_VERSION,

          // CORS
          CORS_ENABLED: CORS_ENABLED,
          CORS_ORIGIN: CORS_ORIGIN,
        },
      },
      publicLoadBalancer: true, // Internet-facing ALB
      desiredCount: DESIRED_COUNT, // Number of tasks to run
      cpu: CPU, // 0.25 vCPU
      memoryLimitMiB: MEMORY, // 512 MB
      assignPublicIp: false, // Tasks run in private subnets
    });

    // Configure health check for the target group
    fargateService.targetGroup.configureHealthCheck({
      path: HEALTH_CHECK_PATH,
      interval: cdk.Duration.seconds(HEALTH_CHECK_INTERVAL),
      timeout: cdk.Duration.seconds(HEALTH_CHECK_TIMEOUT),
      healthyThresholdCount: HEALTHY_THRESHOLD,
      unhealthyThresholdCount: UNHEALTHY_THRESHOLD,
    });

    // Auto Scaling configuration
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: MIN_CAPACITY,
      maxCapacity: MAX_CAPACITY,
    });

    // Scale based on CPU utilization
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Scale based on memory utilization
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Output the ALB DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the Application Load Balancer',
    });

    // Output the service name
    new cdk.CfnOutput(this, 'ServiceName', {
      value: fargateService.service.serviceName,
      description: 'Name of the Fargate Service',
    });

    // Output the cluster name
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      description: 'Name of the ECS Cluster',
    });
  }
}
