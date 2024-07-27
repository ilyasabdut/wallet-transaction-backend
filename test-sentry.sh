#!/bin/bash

export SENTRY_AUTH_TOKEN=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
export SENTRY_DSN=https://c7e5d8bb46902a7439bb57f97cfa87bb@o4507669027815424.ingest.us.sentry.io/4507669035286528
export SENTRY_ORG=ilyasabdut-hobby-project
VERSION=$(sentry-cli releases propose-version)

# Create a release
sentry-cli releases new -p 4507669035286528 $VERSION

# Associate commits with the release
sentry-cli releases set-commits --auto $VERSION
