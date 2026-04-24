# Release Guide

This repository uses Changesets for versioning and release publishing.

## Steps

1. Add a changeset with `pnpm changeset`.
2. Merge the pull request into `main`.
3. Wait for the `Release` workflow to create or update the release pull request.
4. Merge the release pull request.
5. Confirm that the package was published to npm and a GitHub release was created.

## Notes

- The release workflow runs on pushes to `main`.
- The workflow creates a release pull request from pending changesets.
- Merging the release pull request publishes the package.
- npm publishing uses trusted publishing with GitHub OIDC and the `npm-publish` environment.
