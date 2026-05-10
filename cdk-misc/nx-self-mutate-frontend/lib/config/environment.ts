import type * as cdk from 'aws-cdk-lib';
import { z } from 'zod';

export const environmentNameSchema = z.enum(['dev', 'qa', 'prod']);

export type EnvironmentName = z.infer<typeof environmentNameSchema>;

export interface EnvironmentProps {
  environmentName: EnvironmentName;
}

export type EnvironmentStageProps = cdk.StageProps & EnvironmentProps;

export type EnvironmentStackProps = cdk.StackProps & EnvironmentProps;
