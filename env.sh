#!/bin/sh

cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  API_URL: "${API_URL}",
  PORT: "${PORT}",
  OAUTH_CLIENT_ID: "${OAUTH_CLIENT_ID}",
  TENANT_NAME: "${TENANT_NAME}",
  TENANT_ID: "${TENANT_ID}",
}
EOF

exec "$@"
