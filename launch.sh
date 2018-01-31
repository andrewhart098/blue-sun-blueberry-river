#!/bin/bash

docker stop -t0 $(docker ps -q)

docker-compose build

docker-compose up
