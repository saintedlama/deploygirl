#!/usr/bin/env bash

APP_NAME=expressapp
BASE_DIR=/var/nodejs/
DEPLOY_DIR=$BASE_DIR/$APP_NAME

SERVICE_USER=$APP_NAME
SERVICE_GROUP=$SERVICE_USER

SERVICE_COMMAND=/bin/www
SERVICE_ENV='NODE_ENV="production",PORT="9999",HOSTNAME=""'

# 1. Infrastructure Setup

## Current working directory is the current applications directory not .deploy directory
echo $PWD

## Add a user if not exists
id -u $SERVICE_USER &>/dev/null || useradd -M -s /bin/false $SERVICE_USER

# TODO: changing user or var is a problem!

## Create and chown destination
mkdir -m 770 -p $DEPLOY_DIR
chown --recursive $SERVICE_USER:$SERVICE_GROUP $DEPLOY_DIR

# 2. Build and Deploy

## Install dependencies locally
npm i

## Copy project files
cp -r -f ./ $DEPLOY_DIR

## Build a supervisord configuration from template
sed -e 's:APP_NAME:$APP_NAME:g' -e 's:DEPLOY_DIR:$DEPLOY_DIR:g' \
	-e 's:SERVICE_COMMAND:$SERVICE_COMMAND:g' -e 's:SERVICE_ENV:$SERVICE_ENV:g' \
	supervisord.conf > /etc/supervisor/conf.d/$APP_NAME.conf
	
# 3. Start Service

## Reload configuration and restart supervisor program
supervisorctl update $APP_NAME

## Start the service
supervisorctl start $APP_NAME &>/dev/null

## If the service was already started try a restart
if [ "$?" = "0" ]; then
	echo "Started sucessfully"
else
	supervisorctl restart $APP_NAME
	exit $?
fi
