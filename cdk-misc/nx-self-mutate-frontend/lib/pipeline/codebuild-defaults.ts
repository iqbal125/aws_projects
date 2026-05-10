import * as codebuild from 'aws-cdk-lib/aws-codebuild';

/** Repo-relative CDK synth output directory (monorepo root). */
export const CDK_INFRA_CDK_OUT_DIRECTORY = 'infra/cdk-infra/cdk.out';

export const PIPELINE_LINUX_BUILD_IMAGE = codebuild.LinuxBuildImage.STANDARD_7_0;

/** Partial buildspec applied to synth and self-mutation CodeBuild steps. */
export const NODE_22_PARTIAL_BUILD_SPEC = codebuild.BuildSpec.fromObject({
  version: '0.2',
  phases: {
    install: {
      'runtime-versions': {
        nodejs: 22,
      },
    },
  },
  cache: {
    paths: [
      '.pnpm-store/**/*',
      // SelfMutate runs `npm install -g aws-cdk` (not pnpm); cache tarball store between builds.
      '/root/.npm/**/*',
    ],
  },
});

export function pipelineCodeBuildEnvironment(): codebuild.BuildEnvironment {
  return {
    buildImage: PIPELINE_LINUX_BUILD_IMAGE,
  };
}

/** Local CodeBuild CUSTOM cache (paths listed in {@link NODE_22_PARTIAL_BUILD_SPEC}). */
export function pipelinePnpmStoreCache(): codebuild.Cache {
  return codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM);
}

/** CodeBuild-safe Nx defaults (daemon + filesystem watchers break in ephemeral CI agents). */
export function pipelineNxCodeBuildEnvironmentVars(): Record<string, codebuild.BuildEnvironmentVariable> {
  return {
    CI: { value: 'true' },
    NX_DAEMON: { value: 'false' },
  };
}

/** First command in pipeline CodeBuild steps that require Corepack-managed package managers. */
export const PIPELINE_COREPACK_ENABLE_COMMAND = 'corepack enable';

/** Shared install using repo-relative pnpm store (matches CodeBuild local CUSTOM cache path). */
export const PIPELINE_PNPM_INSTALL_COMMAND = 'pnpm install --frozen-lockfile --store-dir .pnpm-store';
