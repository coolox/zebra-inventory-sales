#!/usr/bin/env bash

set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this bootstrap as root on the VPS." >&2
  exit 1
fi

backup_user="${BACKUP_VPS_USER:-zebra-backup}"
backup_root="${BACKUP_VPS_PATH:-/srv/zebra-backups}"
backup_public_key="${BACKUP_VPS_SSH_PUBLIC_KEY:-}"

if [[ -z "$backup_public_key" ]] || [[ ! "$backup_user" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || [[ ! "$backup_root" =~ ^/([A-Za-z0-9._-]+/)*[A-Za-z0-9._-]+$ ]] || [[ "$backup_root" == *..* ]]; then
  echo "Set BACKUP_VPS_SSH_PUBLIC_KEY and safe BACKUP_VPS_USER/BACKUP_VPS_PATH values." >&2
  exit 1
fi

if ! id "$backup_user" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$backup_user"
fi

chmod 700 "/home/$backup_user"
install -d -o root -g root -m 755 "${backup_root%/*}"
install -d -o "$backup_user" -g "$backup_user" -m 700 "$backup_root"
install -d -o "$backup_user" -g "$backup_user" -m 700 "$backup_root/zebra-retail/staging/daily"
install -d -o "$backup_user" -g "$backup_user" -m 700 "$backup_root/zebra-retail/staging/incoming"
install -d -o "$backup_user" -g "$backup_user" -m 700 "/home/$backup_user/.ssh"
touch "/home/$backup_user/.ssh/authorized_keys"
chown "$backup_user:$backup_user" "/home/$backup_user/.ssh/authorized_keys"
chmod 600 "/home/$backup_user/.ssh/authorized_keys"

if ! grep -qxF "$backup_public_key" "/home/$backup_user/.ssh/authorized_keys"; then
  printf '%s\n' "$backup_public_key" >> "/home/$backup_user/.ssh/authorized_keys"
fi

echo "Backup user configured. No existing Zebra bot files or services were changed."
