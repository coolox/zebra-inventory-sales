#!/usr/bin/env bash

set -euo pipefail
umask 077

required_variables=(
  SUPABASE_DB_URL
  SUPABASE_DB_POOLER_HOST
  SUPABASE_DB_POOLER_PORT
  SUPABASE_STORAGE_S3_ENDPOINT
  SUPABASE_STORAGE_S3_REGION
  SUPABASE_STORAGE_S3_ACCESS_KEY_ID
  SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY
  BACKUP_VPS_HOST
  BACKUP_VPS_PORT
  BACKUP_VPS_USER
  BACKUP_VPS_PATH
  BACKUP_VPS_SSH_PRIVATE_KEY
  BACKUP_VPS_KNOWN_HOSTS
  BACKUP_AGE_RECIPIENT
)

for variable_name in "${required_variables[@]}"; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "Missing required backup configuration: ${variable_name}" >&2
    exit 1
  fi
done

if [[ ! "$BACKUP_VPS_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || [[ ! "$BACKUP_VPS_PORT" =~ ^[0-9]{1,5}$ ]]; then
  echo "Invalid backup VPS host or port." >&2
  exit 1
fi

if [[ ! "$SUPABASE_DB_POOLER_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || [[ ! "$SUPABASE_DB_POOLER_PORT" =~ ^[0-9]{1,5}$ ]]; then
  echo "Invalid Supabase pooler host or port." >&2
  exit 1
fi

if [[ ! "$BACKUP_VPS_USER" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || [[ ! "$BACKUP_VPS_PATH" =~ ^/([A-Za-z0-9._-]+/)*[A-Za-z0-9._-]+$ ]] || [[ "$BACKUP_VPS_PATH" == *..* ]]; then
  echo "Invalid backup VPS user or path." >&2
  exit 1
fi

if [[ ! "$BACKUP_AGE_RECIPIENT" =~ ^age1[0-9a-z]+$ ]]; then
  echo "Invalid age recipient. Backup encryption requires an age public recipient." >&2
  exit 1
fi

backup_id="${BACKUP_ID:-$(date -u +%F)}"
if [[ ! "$backup_id" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Invalid backup identifier." >&2
  exit 1
fi

work_dir="$(mktemp -d)"
ssh_key_path="$work_dir/backup_key"
known_hosts_path="$work_dir/known_hosts"
pooler_db_url_path="$work_dir/pooler-db-url"
payload_dir="$work_dir/payload"
trap 'rm -rf "$work_dir"' EXIT

mkdir -p "$payload_dir/database" "$payload_dir/product-images"
printf '%s\n' "$BACKUP_VPS_SSH_PRIVATE_KEY" > "$ssh_key_path"
printf '%s\n' "$BACKUP_VPS_KNOWN_HOSTS" > "$known_hosts_path"
chmod 600 "$ssh_key_path" "$known_hosts_path"

# GitHub-hosted runners are IPv4-only. Transform the existing direct connection
# URL locally without logging its password; pooler username embeds the project ref.
node - "$pooler_db_url_path" <<'NODE'
const fs = require('node:fs');
const outputPath = process.argv[2];
const source = new URL(process.env.SUPABASE_DB_URL);
const refMatch = source.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);

if (!refMatch || source.username !== 'postgres' || !source.pathname) {
  throw new Error('SUPABASE_DB_URL must be a direct Supabase Postgres URL.');
}

source.hostname = process.env.SUPABASE_DB_POOLER_HOST;
source.port = process.env.SUPABASE_DB_POOLER_PORT;
source.username = `postgres.${refMatch[1]}`;
fs.writeFileSync(outputPath, source.toString(), { mode: 0o600 });
NODE

pooler_db_url="$(<"$pooler_db_url_path")"

supabase db dump --db-url "$pooler_db_url" --role-only -f "$payload_dir/database/roles.sql"
supabase db dump --db-url "$pooler_db_url" -f "$payload_dir/database/schema.sql"
supabase db dump --db-url "$pooler_db_url" --data-only --use-copy -f "$payload_dir/database/data.sql"

rclone sync ':s3:product-images' "$payload_dir/product-images" \
  --s3-provider Other \
  --s3-endpoint "$SUPABASE_STORAGE_S3_ENDPOINT" \
  --s3-region "$SUPABASE_STORAGE_S3_REGION" \
  --s3-access-key-id "$SUPABASE_STORAGE_S3_ACCESS_KEY_ID" \
  --s3-secret-access-key "$SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY" \
  --s3-force-path-style

for dump_file in "$payload_dir/database/roles.sql" "$payload_dir/database/schema.sql" "$payload_dir/database/data.sql"; do
  if [[ ! -s "$dump_file" ]]; then
    echo "Backup dump is unexpectedly empty: ${dump_file##*/}" >&2
    exit 1
  fi
done

archive_path="$work_dir/staging-${backup_id}.tar.gz"
encrypted_archive_path="$archive_path.age"
tar --sort=name --mtime="UTC 1970-01-01" --owner=0 --group=0 --numeric-owner -C "$payload_dir" -czf "$archive_path" .
age -r "$BACKUP_AGE_RECIPIENT" -o "$encrypted_archive_path" "$archive_path"
(cd "$work_dir" && sha256sum "${encrypted_archive_path##*/}" > SHA256SUMS)

remote_root="${BACKUP_VPS_PATH%/}/zebra-retail/staging"
ssh_target="${BACKUP_VPS_USER}@${BACKUP_VPS_HOST}"
ssh_options=(-i "$ssh_key_path" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$known_hosts_path" -p "$BACKUP_VPS_PORT")
rsync_ssh_command="ssh"
for ssh_option in "${ssh_options[@]}"; do
  printf -v rsync_ssh_command '%s %q' "$rsync_ssh_command" "$ssh_option"
done

ssh "${ssh_options[@]}" "$ssh_target" "umask 077; mkdir -p '$remote_root/incoming' '$remote_root/daily'; test ! -e '$remote_root/daily/$backup_id'"
ssh "${ssh_options[@]}" "$ssh_target" "umask 077; mkdir -p '$remote_root/incoming/$backup_id'; chmod 700 '$remote_root/incoming/$backup_id'"
rsync -a -e "$rsync_ssh_command" --chmod=Du=rwx,Dgo=,Fu=rw,Fgo= -- "$encrypted_archive_path" "$work_dir/SHA256SUMS" "$ssh_target:$remote_root/incoming/$backup_id/"
ssh "${ssh_options[@]}" "$ssh_target" "set -eu; cd '$remote_root/incoming/$backup_id'; sha256sum -c SHA256SUMS; mv '$remote_root/incoming/$backup_id' '$remote_root/daily/$backup_id'; find '$remote_root/daily' -mindepth 1 -maxdepth 1 -type d -mtime +13 -exec rm -rf -- {} +; test -f '$remote_root/daily/$backup_id/staging-$backup_id.tar.gz.age'"

echo "Encrypted staging backup completed: ${backup_id}; retention: 14 daily copies."
