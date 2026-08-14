#!/bin/bash
# Start do Mission Control (produção) na porta 3020.
# Usado pelo LaunchAgent com.mission-control.server
set -e
cd "$HOME/mission-control"

# Se não há build ou o código mudou depois do último build, rebuilda
if [ ! -d .next ] || [ src -nt .next/BUILD_ID ] 2>/dev/null; then
  NEXT_TELEMETRY_DISABLED=1 CI=1 npm run build >> "$HOME/Library/Logs/mission-control.log" 2>&1
fi

export NEXT_TELEMETRY_DISABLED=1
exec npm run start
