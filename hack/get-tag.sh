#!/bin/bash
latest_release_sha=$(curl https://api.github.com/repos/deliverybot/helm/tags | jq -r '.[0].commit.sha')
latest_release_version=$(curl https://api.github.com/repos/deliverybot/helm/tags | jq -r '.[0].name')
echo $latest_release_sha
echo $latest_release_version
if [[ $latest_release_sha == $COMMIT_SHA ]]; then
  echo $latest_release_version > /workspace/_TAG
else
  echo $BRANCH_NAME > /workspace/_TAG
fi

cat _TAG
