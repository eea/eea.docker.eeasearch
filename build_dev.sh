#!/bin/bash

echo "Buidling eeacms/eeasearch locally with local eea.searchserver.js"

set -e

if [ -z $1 ]; then
    echo "Usage: ./build_dev.sh PATH_TO_SEACHSERVER_JS_REPO"
    exit 100
fi

if [ ! -d $1 ]; then
    echo "$1 is not a directory!"
    exit 100
fi

SEARCHSERVER_DIR=$1

function cleanup() {
    echo "Cleanup"
    rm -rf ./eea-searchserver
}

trap 'cleanup' INT

rm -rf ./eea-searchserver && cp -r $SEARCHSERVER_DIR  ./eea-searchserver
docker build -t "eeacms/eeasearch" -f Dockerfile.dev .

cleanup
echo "Done"
