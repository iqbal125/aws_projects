import * as iam from 'aws-cdk-lib/aws-iam';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { FrontendStage } from '../../stages/frontend';
import {
  PIPELINE_COREPACK_ENABLE_COMMAND,
  PIPELINE_PNPM_INSTALL_COMMAND,
  pipelineCodeBuildEnvironment,
  pipelineNxCodeBuildEnvironmentVars,
  pipelinePnpmStoreCache,
} from '../codebuild-defaults';
import type { FrontendPipelineStageProps } from './types';

/** Commands shared between prepare-git and affected logic (bash). */
function publishFrontendCommands(forceFrontendDeploy: boolean): string[] {
  const compareBranch =
    'COMPARE_BRANCH="${NX_AFFECTED_COMPARE_BRANCH:-main}" && ' +
    '(git fetch origin "${COMPARE_BRANCH}" --depth=500 || git fetch origin "${COMPARE_BRANCH}" || true) && ' +
    'export NX_BASE="origin/${COMPARE_BRANCH}" && ' +
    'export NX_HEAD="${CODEBUILD_RESOLVED_SOURCE_VERSION:-$(git rev-parse HEAD)}" && ' +
    'pnpm exec nx show projects --affected --base="$NX_BASE" --head="$NX_HEAD" --sep=" " || true';

  const buildForced =
    'pnpm nx run frontend:build -- --mode "$DEPLOY_ENV" --outDir ../../dist/apps/frontend/$DEPLOY_ENV';

  const buildAffected =
    'set +e && ' +
    'pnpm exec nx affected -t build --projects=frontend --base="$NX_BASE" --head="$NX_HEAD" -- --mode "$DEPLOY_ENV" --outDir ../../dist/apps/frontend/$DEPLOY_ENV; ' +
    'AF=$? && set -e && ' +
    'if [ "$AF" -ne 0 ]; then echo "nx affected failed (exit $AF); falling back to full frontend build"; ' +
    buildForced +
    '; fi';

  const buildBlock =
    forceFrontendDeploy === true
      ? buildForced
      : `if [ "\${FORCE_FRONTEND_DEPLOY:-0}" = "1" ]; then ${buildForced}; else ${buildAffected}; fi`;

  const deployGuard =
    'DIST_DIR="dist/apps/frontend/$DEPLOY_ENV" && ' +
    'if [ -f "$DIST_DIR/index.html" ]; then ' +
    'test -n "$FRONTEND_ASSETS_BUCKET_NAME" && test -n "$FRONTEND_DISTRIBUTION_ID" && ' +
    'aws s3 sync "$DIST_DIR" "s3://$FRONTEND_ASSETS_BUCKET_NAME" --delete && ' +
    'aws cloudfront create-invalidation --distribution-id "$FRONTEND_DISTRIBUTION_ID" --paths "/*"; ' +
    'else echo "Skipping S3 sync and CloudFront invalidation: no $DIST_DIR/index.html"; fi';

  return [
    PIPELINE_COREPACK_ENABLE_COMMAND,
    PIPELINE_PNPM_INSTALL_COMMAND,
    compareBranch,
    buildBlock,
    deployGuard,
  ];
}

export class FrontendPipelineStage extends Construct {
  public readonly stage: FrontendStage;

  constructor(scope: Construct, id: string, props: FrontendPipelineStageProps) {
    super(scope, id);

    const stageId = `Frontend-${props.environmentName}`;
    this.stage = new FrontendStage(this, stageId, {
      env: props.env,
      environmentName: props.environmentName,
    });

    const nxEnv = pipelineNxCodeBuildEnvironmentVars();

    const publishFrontendAssets = new pipelines.CodeBuildStep('PublishFrontendAssets', {
      input: props.source,
      buildEnvironment: {
        ...pipelineCodeBuildEnvironment(),
        environmentVariables: {
          ...nxEnv,
          DEPLOY_ENV: { value: props.environmentName },
          VITE_API_URL: { value: props.viteApiUrl },
          NX_AFFECTED_COMPARE_BRANCH: { value: props.nxAffectedCompareBranch },
          FORCE_FRONTEND_DEPLOY: { value: props.forceFrontendDeploy === true ? '1' : '0' },
        },
      },
      envFromCfnOutputs: {
        FRONTEND_ASSETS_BUCKET_NAME: this.stage.assetsBucketNameOutput,
        FRONTEND_DISTRIBUTION_ID: this.stage.distributionIdOutput,
      },
      partialBuildSpec: props.node22BuildSpec,
      cache: pipelinePnpmStoreCache(),
      commands: publishFrontendCommands(props.forceFrontendDeploy === true),
      rolePolicyStatements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['cloudfront:CreateInvalidation'],
          resources: ['*'],
        }),
      ],
    });

    props.pipeline.addStage(this.stage, {
      pre: props.pre,
      post: [publishFrontendAssets],
    });
  }
}
