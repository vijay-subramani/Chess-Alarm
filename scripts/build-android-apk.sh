#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pick_java_home() {
  if [[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/java" ]]; then
    echo "$JAVA_HOME"
    return
  fi
  if [[ -x "/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/java" ]]; then
    echo "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    return
  fi
  local jbr
  jbr="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
  if [[ -n "$jbr" && -x "$jbr/bin/java" ]]; then
    echo "$jbr"
    return
  fi
  jbr="$(ls -d "$HOME"/Library/Java/JavaVirtualMachines/jbr-*/Contents/Home 2>/dev/null | head -1 || true)"
  if [[ -n "$jbr" && -x "$jbr/bin/java" ]]; then
    echo "$jbr"
    return
  fi
  echo "Could not find JDK 17+. Install Android Studio or set JAVA_HOME." >&2
  exit 1
}

JAVA_HOME="$(pick_java_home)"
export JAVA_HOME

# Gradle's daemon often runs without Homebrew/nvm on PATH, so `npx` fails during autolinking.
prepend_path() {
  local dir="$1"
  if [[ -n "$dir" && -d "$dir" && ":$PATH:" != *":$dir:"* ]]; then
    PATH="$dir:$PATH"
  fi
}
if command -v node >/dev/null 2>&1; then
  prepend_path "$(dirname "$(command -v node)")"
fi
prepend_path "/opt/homebrew/bin"
prepend_path "/usr/local/bin"
if [[ -n "${NVM_DIR:-}" && -d "$NVM_DIR/versions/node" ]]; then
  nvm_node="$(ls -d "$NVM_DIR/versions/node/"*/bin 2>/dev/null | tail -1 || true)"
  prepend_path "$nvm_node"
fi
export PATH
export NODE_BINARY="${NODE_BINARY:-$(command -v node || true)}"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found on PATH. Install Node.js or add it to PATH before building." >&2
  exit 1
fi

echo "Using JAVA_HOME=$JAVA_HOME"
echo "Using NODE_BINARY=${NODE_BINARY:-unset} ($(command -v node))"
echo "Using npx=$(command -v npx)"
"$JAVA_HOME/bin/java" -version

echo "Generating alarm sound assets..."
(cd "$ROOT" && npm run generate:alarm)

cd "$ROOT/android"

# Stale Gradle daemons often lack Homebrew/nvm on PATH; stop so the next run inherits env.
./gradlew --stop >/dev/null 2>&1 || true

TASK="${1:-assembleRelease}"
shift || true

GRADLE_ARGS=(
  "$TASK"
  -PreactNativeArchitectures=arm64-v8a
  -Dorg.gradle.java.installations.auto-download=false
  -Dorg.gradle.java.installations.paths="$JAVA_HOME"
)

if [[ "${CLEAN:-}" == "1" ]]; then
  echo "Cleaning Android build outputs..."
  env PATH="$PATH" NODE_BINARY="${NODE_BINARY:-}" ./gradlew clean \
    -PreactNativeArchitectures=arm64-v8a \
    -Dorg.gradle.java.installations.auto-download=false \
    -Dorg.gradle.java.installations.paths="$JAVA_HOME" \
    "$@"
fi

env PATH="$PATH" NODE_BINARY="${NODE_BINARY:-}" ./gradlew "${GRADLE_ARGS[@]}" "$@"

if [[ "$TASK" == "bundleRelease" ]]; then
  OUT="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
  echo ""
  echo "AAB ready: $OUT"
else
  APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
  echo ""
  echo "APK ready: $APK"
  if [[ -f "$APK" ]]; then
    ls -lh "$APK"
  fi
fi
