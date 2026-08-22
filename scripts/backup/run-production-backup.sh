#!/usr/bin/env bash

set -euo pipefail

BACKUP_SCOPE=production exec "$(dirname "$0")/run-staging-backup.sh"
