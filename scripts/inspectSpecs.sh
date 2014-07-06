#!/bin/bash

BASE_DIR=`dirname $0`

node --debug-brk $BASE_DIR/../node_modules/jasmine-node/lib/jasmine-node/cli.js .