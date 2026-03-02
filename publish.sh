#!/bin/bash

if [ -z "$1" ]; then
    msg="Updates"
else
    msg="$1"
fi

rm -rf dist
tsc
git add .
git commit -m "$msg"
git push
bun publish
