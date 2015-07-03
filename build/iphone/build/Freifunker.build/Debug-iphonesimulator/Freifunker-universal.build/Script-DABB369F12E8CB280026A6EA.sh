#!/bin/sh
export TITANIUM_PREFIX="_Prefix-*"
echo "Xcode Pre-Compile Phase: Removing $SHARED_PRECOMPS_DIR/$PROJECT$TITANIUM_PREFIX"
find "$SHARED_PRECOMPS_DIR" -name "$PROJECT$TITANIUM_PREFIX" -print0 | xargs -0 rm -rf
if [ "x$TITANIUM_CLI_XCODEBUILD" == "x" ]; then
    /usr/local/bin/node "/Users/fuerst/.appcelerator/install/4.0.2/package/node_modules/appc-cli-titanium/node_modules/titanium/bin/titanium" build --platform iphone --sdk "4.0.1.v20150529150210" --no-prompt --no-progress-bars --no-banner --no-colors --build-only --xcode
    exit $?
else
    echo "skipping pre-compile phase"
fi
