#!/bin/sh
set -e

TIZEN_CLI="$(command -v tizen 2>/dev/null || true)"
SDB_BIN="$(command -v sdb 2>/dev/null || true)"

if [ -z "$TIZEN_CLI" ]; then
    if [ -x "$HOME/tizen-studio/tools/ide/bin/tizen" ]; then
        TIZEN_CLI="$HOME/tizen-studio/tools/ide/bin/tizen"
    fi
fi

if [ -z "$SDB_BIN" ]; then
    if [ -x "$HOME/tizen-studio/tools/sdb" ]; then
        SDB_BIN="$HOME/tizen-studio/tools/sdb"
    fi
fi

if [ -z "$TIZEN_CLI" ]; then
    echo "tizen CLI not found. Install Tizen Studio and ensure the CLI is on PATH."
    exit 1
fi

if [ -z "$SDB_BIN" ]; then
    echo "sdb not found. Install Tizen Studio and ensure the CLI is on PATH."
    exit 1
fi

echo "Building web app..."
"$TIZEN_CLI" build-web

echo "Packaging widget..."
"$TIZEN_CLI" package -t wgt

echo "Done. Look for a .wgt file in the project directory."
