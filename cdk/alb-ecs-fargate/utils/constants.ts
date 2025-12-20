// AWS Configuration
export const AWS_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT;
export const AWS_REGION = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

// ECR Configuration
export const ECR_REPOSITORY_NAME = process.env.ECR_REPOSITORY_NAME || 'micro-service/nestjstodo';
export const IMAGE_TAG = process.env.IMAGE_TAG || 'latest';

// Container Configuration
export const CONTAINER_PORT = parseInt(process.env.CONTAINER_PORT || '80');
export const APP_NAME = process.env.APP_NAME || 'fargate-app';

// Fargate Service Configuration
export const DESIRED_COUNT = parseInt(process.env.DESIRED_COUNT || '2');
export const CPU = parseInt(process.env.CPU || '256');
export const MEMORY = parseInt(process.env.MEMORY || '512');

// Health Check Configuration
export const HEALTH_CHECK_PATH = process.env.HEALTH_CHECK_PATH || '/health';
export const HEALTH_CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL || '30');
export const HEALTH_CHECK_TIMEOUT = parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5');
export const HEALTHY_THRESHOLD = parseInt(process.env.HEALTHY_THRESHOLD || '2');
export const UNHEALTHY_THRESHOLD = parseInt(process.env.UNHEALTHY_THRESHOLD || '3');

// Auto Scaling Configuration
export const MIN_CAPACITY = parseInt(process.env.MIN_CAPACITY || '2');
export const MAX_CAPACITY = parseInt(process.env.MAX_CAPACITY || '4');

// Application Environment Variables (passed to ECS container)
export const NODE_ENV = process.env.NODE_ENV || 'production';
export const PORT = process.env.PORT || '80';
export const APP_VERSION = process.env.APP_VERSION || '0.1.0';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
export const SWAGGER_TITLE = process.env.SWAGGER_TITLE || 'NestJS API';
export const SWAGGER_DESCRIPTION = process.env.SWAGGER_DESCRIPTION || 'The NestJS API description';
export const SWAGGER_VERSION = process.env.SWAGGER_VERSION || '0.1';
export const CORS_ENABLED = process.env.CORS_ENABLED || 'false';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
