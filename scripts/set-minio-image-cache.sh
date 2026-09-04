#!/usr/bin/env bash
set -euo pipefail

readonly ENV_FILE="/home/hayshj/photography/.env"
readonly MC_BIN="/home/hayshj/.local/bin/mc"
readonly CACHE_CONTROL="public, max-age=31536000, immutable"
readonly ALIAS_NAME="photography-cache-origin"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ "$MINIO_USE_SSL" == "true" ]]; then
  scheme="https"
else
  scheme="http"
fi

"$MC_BIN" alias set "$ALIAS_NAME" "${scheme}://${MINIO_ENDPOINT}:${MINIO_PORT}" \
  "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" >/dev/null

# MinIO stores Cache-Control as object metadata. Copy each object onto its exact
# existing key so only metadata changes; keys and image bytes remain unchanged.
"$MC_BIN" find "${ALIAS_NAME}/${MINIO_BUCKET}" --name '*' |
  xargs -d '\n' -r -P 8 -n 1 bash -c '
    mc_bin="$1"
    cache_control="$2"
    object="$3"
    "$mc_bin" cp --quiet --attr "Cache-Control=${cache_control}" "$object" "$object" >/dev/null
  ' _ "$MC_BIN" "$CACHE_CONTROL"
