#!/bin/bash
cd "$(dirname ${BASH_SOURCE[0]})"
pwd
rm logmongodb*.*
mongodb-osx-x86_64-2.2.0/bin/mongod --fork  --dbpath data --logpath logmongodb.txt
echo "starting node"
./node-v0.8.8-darwin-x64/bin/node app.js 

#echo "starting client"
#open http://localhost:3001/