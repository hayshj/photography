#!/usr/bin/env bash
set -a
source /home/hayshj/photography/.env
set +a
export MINIO_ROOT_USER="$MINIO_ACCESS_KEY"
export MINIO_ROOT_PASSWORD="$MINIO_SECRET_KEY"
exec /home/hayshj/.local/bin/minio server /home/hayshj/minio-data --address 127.0.0.1:9000 --console-address 127.0.0.1:9001
