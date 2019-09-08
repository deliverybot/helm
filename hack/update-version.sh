#!/bin/bash
export version=$(cat package.json | jq -r '.version')
yq --yaml-output '.runs.image = "gcr.io/deliverybot/helm:v'${version}'"' < action.yml > action.yml.b && mv action.yml.b action.yml
git add .
