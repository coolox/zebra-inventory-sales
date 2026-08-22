#!/usr/bin/env bash

set -euo pipefail

BACKUP_SCOPE=production exec bash "$(dirname "$0")/run-staging-backup.sh"
