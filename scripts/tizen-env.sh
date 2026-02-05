#!/bin/sh
set -e

SDK_ROOT="${TIZEN_SDK_HOME:-$HOME/tizen-studio-full}"

if [ ! -d "$SDK_ROOT" ]; then
    echo "Tizen SDK root not found at: $SDK_ROOT"
    echo "Set TIZEN_SDK_HOME or install to the default location."
    exit 1
fi

export TIZEN_SDK_HOME="$SDK_ROOT"
export PATH="$SDK_ROOT/tools:$SDK_ROOT/tools/ide/bin:$PATH"
export JAVA_HOME="$SDK_ROOT/jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "TIZEN_SDK_HOME=$TIZEN_SDK_HOME"
echo "JAVA_HOME=$JAVA_HOME"
echo "tizen=$(command -v tizen || true)"
echo "sdb=$(command -v sdb || true)"

exec "$@"
